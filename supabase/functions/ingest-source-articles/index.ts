import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const MAX_CONTENT_CHARS = 8000;
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; Verificat-Bot/1.0; +https://verificat.xyz/bot)",
  Accept:
    "application/rss+xml, application/atom+xml, application/json, text/xml, */*",
};

Deno.serve(async (_req: Request) => {
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dbHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const srcResp = await fetch(
    `${SUPABASE_URL}/rest/v1/sources?select=id,name,url,feed_url,category,language&feed_url=not.is.null`,
    { headers: dbHeaders },
  );
  if (!srcResp.ok) {
    const err = await srcResp.text();
    return new Response(JSON.stringify({ error: `sources fetch failed: ${err}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const sources = await srcResp.json() as Array<{
    id: string; name: string; url: string; feed_url: string;
    category: string; language: string[];
  }>;

  if (sources.length === 0) {
    return new Response(JSON.stringify({ message: "No sources with feed_url", articles_added: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const logEntries: Array<{
    source_id: string; articles_added: number; errors: string | null; duration_ms: number;
  }> = [];
  let totalAdded = 0;

  for (const source of sources) {
    const start = Date.now();
    let added = 0;
    let errMsg: string | null = null;
    try {
      added = await ingestSource(dbHeaders, source);
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

  await fetch(`${SUPABASE_URL}/rest/v1/ingest_runs`, {
    method: "POST", headers: dbHeaders, body: JSON.stringify(logEntries),
  });

  return new Response(JSON.stringify({
    message: "Ingest complete",
    sources_processed: sources.length,
    articles_added: totalAdded,
    log_entries: logEntries,
  }), { headers: { "Content-Type": "application/json" } });
});

async function ingestSource(
  dbHeaders: Record<string, string>,
  source: { id: string; name: string; feed_url: string },
): Promise<number> {
  const resp = await fetch(source.feed_url, {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) {
    throw new Error(`Feed fetch failed (${resp.status}): ${source.feed_url}`);
  }

  const contentType = (resp.headers.get("content-type") || "").toLowerCase();
  const body = await resp.text();
  let items = parseItems(body, contentType);

  // Determine backfill limit
  const countResp = await fetch(
    `${SUPABASE_URL}/rest/v1/source_articles?select=id&source_id=eq.${source.id}&limit=0`,
    { headers: { ...dbHeaders, Prefer: "count=exact" } },
  );
  const existingCount = parseInt(countResp.headers.get("content-range")?.split("/")[1] || "0", 10);
  const limit = existingCount === 0 ? 15 : 10;
  if (items.length > limit) items = items.slice(0, limit);

  let added = 0;
  for (const item of items) {
    if (!item.link || !item.title) continue;

    const existResp = await fetch(
      `${SUPABASE_URL}/rest/v1/source_articles?select=id&article_url=eq.${encodeURIComponent(item.link)}`,
      { headers: dbHeaders },
    );
    if (existResp.ok && (await existResp.json() as Array<{ id: string }>).length > 0) continue;

    let cleanText = item.content || item.description || item.title;
    try {
      const articleResp = await fetch(item.link, {
        headers: FETCH_HEADERS, signal: AbortSignal.timeout(10000),
      });
      if (articleResp.ok) {
        cleanText = (await articleResp.text())
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } catch {}

    if (!cleanText || cleanText.trim().length < 20) continue;
    cleanText = cleanText.slice(0, MAX_CONTENT_CHARS);

    const embedding = await getEmbedding(cleanText.slice(0, 6000));
    if (!embedding) continue;

    const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/source_articles`, {
      method: "POST", headers: dbHeaders,
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
    if (upsertResp.status === 201) added++;
  }
  return added;
}

function parseItems(
  body: string, contentType: string,
): Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> {
  if (contentType.includes("application/json") || body.trim().startsWith("[")) {
    return parseWordPressJson(body);
  }
  if (body.includes("<feed") || body.includes('xmlns="http://www.w3.org/2005/Atom"')) {
    return parseAtom(body);
  }
  return parseRss(body);
}

function parseWordPressJson(
  json: string,
): Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> {
  try {
    const data = JSON.parse(json) as Array<{
      title?: { rendered?: string } | string;
      link?: string;
      date?: string;
      excerpt?: { rendered?: string };
      content?: { rendered?: string };
    }>;
    return data.map((p) => ({
      title: typeof p.title === "object" ? p.title?.rendered || "" : String(p.title || ""),
      link: p.link || "",
      description: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim(),
      content: p.content?.rendered || "",
      pubDate: p.date,
    }));
  } catch {
    return [];
  }
}

function parseAtom(
  xml: string,
): Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> {
  const items: Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> = [];
  const entries = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi);
  for (const match of entries) {
    const block = match[1];
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/);
    items.push({
      title: extractTag(block, "title") || "",
      link: linkMatch ? linkMatch[1] : "",
      content: extractTag(block, "content") || extractTag(block, "summary"),
      description: extractTag(block, "summary")?.slice(0, 300),
      pubDate: extractTag(block, "published") || extractTag(block, "updated"),
    });
  }
  return items;
}

function parseRss(
  xml: string,
): Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> {
  const items: Array<{ title: string; link: string; description?: string; content?: string; pubDate?: string }> = [];
  const rssItems = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
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
  return items;
}

function extractTag(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? decodeHtmlEntities(m[1].trim()) : undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_: string, n: string) => String.fromCharCode(parseInt(n, 10)));
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
  });
  if (!resp.ok) { console.error(`OpenAI embedding error ${resp.status}`); return null; }
  const data = await resp.json() as { data: Array<{ embedding: number[] }> };
  return data.data?.[0]?.embedding ?? null;
}
