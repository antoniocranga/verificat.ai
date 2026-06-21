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

  async retrieveEvidence(claim: NormalizedClaim): Promise<EvidenceResult[]> {
    const results: EvidenceResult[] = [];

    // 1. pgvector similarity search
    try {
      const embedding = await this.getEmbedding(claim.assertion);
      const matches = await this.searchService.searchSimilarClaims(
        embedding,
        0.7,
        5,
      );
      for (const match of matches) {
        results.push({
          title: `Similar Fact-Check Claim`,
          url: '',
          snippet: match.text,
          source: 'Database (pgvector)',
          similarityScore: match.similarity,
        });
      }
    } catch (err) {
      this.logger.warn(`pgvector search failed: ${String(err)}`);
    }

    // 2. Keyword fallback search
    try {
      const words = claim.assertion
        .split(/\s+/)
        .map((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim())
        .filter((w) => w.length > 4);

      if (words.length > 0) {
        const queryFilter = words.map((w) => `text.ilike.%${w}%`).join(',');
        const { data: claimsData } = await this.supabaseService
          .getClient()
          .from('claims')
          .select('id, text')
          .or(queryFilter)
          .limit(5);

        if (claimsData) {
          for (const item of claimsData as Array<{
            id: string;
            text: string;
          }>) {
            // Avoid duplicates
            if (!results.some((r) => r.snippet === item.text)) {
              results.push({
                title: 'Keyword-Matched Factual Source',
                url: '',
                snippet: item.text,
                source: 'Database (Keywords)',
                similarityScore: 0.6,
              });
            }
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Keyword search failed: ${String(err)}`);
    }

    // 3. Outbound URL Fetching (SSRF safe)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls: string[] = [];
    const textToScan = claim.assertion + ' ' + claim.qualifiers.join(' ');
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(textToScan)) !== null) {
      urls.push(match[1]);
    }

    for (const urlStr of urls) {
      try {
        const cleanUrl = urlStr.replace(/[.,;:!?)\]\s]+$/, '');
        this.logger.log(
          `Performing safe HTTP fetch for evidence URL: ${cleanUrl}`,
        );
        const content = await this.safeFetcherService.fetchSafe(cleanUrl);

        // Simple snippet extraction: clean HTML tags, grab first 300 characters
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

    // Sort results by similarity score descending
    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}
