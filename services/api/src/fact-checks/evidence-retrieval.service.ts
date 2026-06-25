import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import { SearchService } from '../search/search.service';
import { SafeFetcherService } from '../common/safe-fetcher/safe-fetcher.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NormalizedClaim } from './claim-detection.service';

export interface EvidenceResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  similarityScore: number;
  sourceId?: string;
  sourceName?: string;
  articleUrl?: string;
  publishedAt?: string;
}

@Injectable()
export class EvidenceRetrievalService {
  private readonly logger = new Logger(EvidenceRetrievalService.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly safeFetcherService: SafeFetcherService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getEmbedding(text: string): Promise<number[]> {
    if (process.env.NODE_ENV === 'test') {
      return new Array<number>(1536).fill(0.1);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.error(
        'OPENAI_API_KEY is not defined. Cannot call Embeddings API.',
      );
      throw new Error('OPENAI_API_KEY is missing.');
    }

    const payload = JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    return new Promise<number[]>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk: Buffer | string) => {
          body += chunk.toString();
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(
              new Error(`OpenAI Embeddings returned status ${res.statusCode}`),
            );
          }
          try {
            const parsed = JSON.parse(body) as {
              data?: Array<{
                embedding?: number[];
              }>;
            };
            const embedding = parsed.data?.[0]?.embedding;
            if (!embedding) {
              return reject(
                new Error('Failed to find embedding in OpenAI response.'),
              );
            }
            resolve(embedding);
          } catch (err) {
            reject(
              new Error(
                `Failed to parse OpenAI embeddings response: ${String(err)}`,
              ),
            );
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  private determineCategories(text: string): string[] {
    const categories = new Set<string>();
    categories.add('fact_checker_international');
    categories.add('fact_checker_ro');
    const lower = text.toLowerCase();
    if (
      /\b(ue|uniunea europeană|nato|uniunea europeană|onu|tratat|lege|legal|directivă|regulament)\b/.test(
        lower,
      )
    ) {
      categories.add('official_body_international');
    }
    if (
      /\b(românia|român|guvern|minister|președinte|parlament|senat|deputat)\b/.test(
        lower,
      )
    ) {
      categories.add('official_body_ro');
    }
    if (
      /\b(conflict|război|militar|atac|invazie|armată|apărare|sancțiune|beligerant)\b/.test(
        lower,
      )
    ) {
      categories.add('think_tank');
      categories.add('wire_agency');
    }
    return Array.from(categories);
  }

  private async matchSourceArticles(
    embedding: number[],
    categories: string[],
    language: string[],
  ): Promise<EvidenceResult[]> {
    const { data, error } = await (
      this.supabaseService.getClient() as unknown as {
        rpc: (
          name: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      }
    ).rpc('match_source_articles', {
      query_embedding: embedding,
      match_threshold: 0.55,
      match_count: 6,
      filter_categories: categories,
      filter_languages: language,
    });

    if (error) {
      this.logger.warn(`match_source_articles RPC failed: ${error.message}`);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return (
      data as Array<{
        id: string;
        source_id: string;
        source_name: string;
        source_category: string;
        article_url: string;
        title: string;
        content: string;
        published_at: string | null;
        similarity: number;
      }>
    ).map((row) => ({
      title: row.title,
      url: row.article_url,
      snippet: (row.content || '').substring(0, 300),
      source: row.source_name,
      similarityScore: Math.round(row.similarity * 100),
      sourceId: row.id,
      sourceName: row.source_name,
      articleUrl: row.article_url,
      publishedAt: row.published_at || undefined,
    }));
  }

  private async searchSourceArticles(
    query: string,
    categories: string[],
    language: string[],
  ): Promise<EvidenceResult[]> {
    if (!query || query.trim().length < 3) return [];
    const { data, error } = await (
      this.supabaseService.getClient() as unknown as {
        rpc: (
          name: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      }
    ).rpc('search_source_articles', {
      search_query: query,
      match_count: 6,
      filter_categories: categories,
      filter_languages: language,
    });

    if (error) {
      this.logger.warn(`search_source_articles RPC failed: ${error.message}`);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return (
      data as Array<{
        id: string;
        source_id: string;
        source_name: string;
        source_category: string;
        article_url: string;
        title: string;
        content: string;
        published_at: string | null;
        rank: number;
      }>
    ).map((row) => ({
      title: row.title,
      url: row.article_url,
      snippet: (row.content || '').substring(0, 300),
      source: row.source_name,
      similarityScore: Math.round(row.rank * 100),
      sourceId: row.id,
      sourceName: row.source_name,
      articleUrl: row.article_url,
      publishedAt: row.published_at || undefined,
    }));
  }

  private async translateToEnglish(text: string): Promise<string> {
    if (process.env.NODE_ENV === 'test') return text;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return text;

    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tradu textul din română în engleză. Păstrează sensul exact. Nu adăuga explicații.' },
        { role: 'user', content: text },
      ],
      temperature: 0,
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    return new Promise<string>((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk: Buffer | string) => { body += chunk.toString(); });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body) as { choices?: Array<{ message?: { content?: string } }> };
            resolve(parsed.choices?.[0]?.message?.content?.trim() || text);
          } catch { resolve(text); }
        });
      });
      req.setTimeout(8000, () => { req.destroy(); resolve(text); });
      req.on('error', () => resolve(text));
      req.write(payload);
      req.end();
    });
  }

  async retrieveEvidence(claim: NormalizedClaim): Promise<EvidenceResult[]> {
    const results: EvidenceResult[] = [];

    // 1. Semantic search via match_source_articles
    try {
      const claimEn = await this.translateToEnglish(claim.assertion);
      const embedding = await this.getEmbedding(claimEn);
      const categories = this.determineCategories(claim.assertion);
      const semanticResults = await this.matchSourceArticles(
        embedding,
        categories,
        ['ro', 'en'],
      );
      results.push(...semanticResults);
    } catch (err) {
      this.logger.warn(`Semantic evidence retrieval failed: ${String(err)}`);
    }

    // 2. Full-text search fallback — if semantic search found nothing
    if (results.length === 0) {
      try {
        const claimEn = await this.translateToEnglish(claim.assertion);
        const categories = this.determineCategories(claim.assertion);
        const searchResults = await this.searchSourceArticles(
          claimEn,
          categories,
          ['ro', 'en'],
        );
        results.push(...searchResults);
      } catch (err) {
        this.logger.warn(`Full-text search failed: ${String(err)}`);
      }
    }

    // 3. Outbound URL Fetching (SSRF safe) — only if no results yet
    if (results.length === 0) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls: string[] = [];
      const textToScan = claim.assertion + ' ' + claim.qualifiers.join(' ');
      let urlMatch: RegExpExecArray | null;
      while ((urlMatch = urlRegex.exec(textToScan)) !== null) {
        urls.push(urlMatch[1]);
      }
      for (const urlStr of urls) {
        try {
          const cleanUrl = urlStr.replace(/[.,;:!?)\]\s]+$/, '');
          const content = await this.safeFetcherService.fetchSafe(cleanUrl);
          const cleanText = content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          results.push({
            title: `Web Evidence Source`,
            url: cleanUrl,
            snippet: cleanText.substring(0, 300),
            source: 'Allowlisted External Link',
            similarityScore: 0.8,
          });
        } catch (err) {
          this.logger.warn(
            `Safe fetch failed for URL "${urlStr}": ${String(err)}`,
          );
        }
      }
    }

    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}
