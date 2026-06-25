import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const MAX_CONTENT_CHARS = 8000;
const MATCH_TARGET_CATEGORIES = [
  "fact_checker_international",
  "fact_checker_ro",
  "wire_agency",
  "think_tank",
  "official_body_international",
  "official_body_ro",
];

Deno.serve(async (_req: Request) => {
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // Fetch sources with feed_url
  const srcResp = await fetch(
    `${SUPABASE_URL}/rest/v1/sources?select=id,name,url,feed_url,category,language&feed_url=not.is.null&category=in.(${MATCH_TARGET_CATEGORIES.map((c) => `"${c}"`).join(",")})`,
    { headers },
  );
  if (!srcResp.ok) {
    const errBody = await srcResp.text();
    return new Response(JSON.stringify({ error: `sources fetch failed: ${errBody}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const sources = await srcResp.json() as Array<{ id: string; name: string; url: string; feed_url: string; category: string; language: string[] }>;

  if (!sources || sources.length === 0) {
    return new Response(
      JSON.stringify({ message: "No sources with feed_url", articles_added: 0 }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const logEntries: Array<{
    source_id: string;
    articles_added: number;
    errors: string | null;
    duration_ms: number;
  }> = [];

  let totalAdded = 0;

  for (const source of sources) {
    const start = Date.now();
    let added = 0;
    let errMsg: string | null = null;
    try {
      added = await ingestSource(headers, source);
      totalAdded += added;
    } catch (e) {
      errMsg = String(e);
    }
    logEntries.push({
      source_id: source.id,
      articles_added: added,
      errors: errMsg,
      duration_ms: Date.now() - start,
    });
  }

  // Write ingest log
  await fetch(`${SUPABASE_URL}/rest/v1/ingest_runs`, {
    method: "POST",
    headers,
    body: JSON.stringify(logEntries),
  });

  return new Response(
    JSON.stringify({
      message: "Ingest complete",
      sources_processed: sources.length,
      articles_added: totalAdded,
      log_entries: logEntries,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});

async function ingestSource(
  headers: Record<string, string>,
  source: { id: string; name: string; feed_url: string },
): Promise<number> {
  const feedResp = await fetch(source.feed_url, {
    headers: { "User-Agent": "Verificat/1.0 (RSS ingester; +https://verificat.xyz)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!feedResp.ok) {
    throw new Error(`Feed fetch failed (${feedResp.status}): ${source.feed_url}`);
  }

  const feedText = await feedResp.text();
  const items = parseFeedItems(feedText);
  let added = 0;

  for (const item of items) {
    if (!item.link || !item.title) continue;

    // Check if article already exists
    const existResp = await fetch(
      `${SUPABASE_URL}/rest/v1/source_articles?select=id&article_url=eq.${encodeURIComponent(item.link)}`,
      { headers },
    );
    if (existResp.ok) {
      const existing = await existResp.json() as Array<{ id: string }>;
      if (existing.length > 0) continue;
    }

    let cleanText = item.content || item.description || item.title;
    try {
      cleanText = await fetchAndCleanArticle(item.link);
    } catch {
      // fallback to RSS content
    }

    if (!cleanText || cleanText.trim().length < 20) continue;
    cleanText = cleanText.slice(0, MAX_CONTENT_CHARS);

    const embedding = await getEmbedding(cleanText.slice(0, 6000));
    if (!embedding) continue;

    const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/source_articles`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_id: source.id,
        article_url: item.link,
        title: item.title,
        content: cleanText,
        summary: item.description?.slice(0, 500),
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        embedding,
        token_count: Math.ceil(cleanText.length / 4),
      }),
    });

    // Conflict is OK (article_url unique)
    if (upsertResp.status === 201) {
      added++;
    }
  }

  return added;
}

function parseFeedItems(xml: string): Array<{
  title: string;
  link: string;
  description?: string;
  content?: string;
  pubDate?: string;
}> {
  const items: Array<{
    title: string;
    link: string;
    description?: string;
    content?: string;
    pubDate?: string;
  }> = [];

  const rssItems = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of rssItems) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title") || "",
      link: extractTag(block, "link") || "",
      description: extractTag(block, "description"),
      content: extractTag(block, "content:encoded"),
      pubDate: extractTag(block, "pubDate"),
    });
  }

  if (items.length > 0) return items;

  const atomItems = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
  for (const match of atomItems) {
    const block = match[1];
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/);
    items.push({
      title: extractTag(block, "title") || "",
      link: linkMatch ? linkMatch[1] : "",
      content: extractTag(block, "content"),
      description: extractTag(block, "summary"),
      pubDate: extractTag(block, "published") || extractTag(block, "updated"),
    });
  }

  return items;
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return decodeHtmlEntities(m[1].trim());
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m: string, n: string) => String.fromCharCode(parseInt(n, 10)));
}

async function fetchAndCleanArticle(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Verificat/1.0 (Article fetcher; +https://verificat.xyz)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) throw new Error(`Article fetch failed (${resp.status})`);

  const html = await resp.text();
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean;
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
  });

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    console.error(`OpenAI embedding error (${resp.status}): ${errBody}`);
    return null;
  }

  const data = await resp.json() as { data: Array<{ embedding: number[] }> };
  return data.data?.[0]?.embedding ?? null;
}
