import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../auth/redis.service';
import { SupabaseService } from '../supabase/supabase.service';

export interface TrustScoreResult {
  score: number;
  reason: string;
}

@Injectable()
export class SourceTrustService {
  private readonly logger = new Logger(SourceTrustService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getSourceTrust(urlStr: string): Promise<TrustScoreResult> {
    let domain = urlStr.trim().toLowerCase();

    // Extract hostname from URL if possible
    try {
      if (urlStr.includes('://')) {
        const parsed = new URL(urlStr);
        domain = parsed.hostname;
      }
    } catch {
      // Keep original trimmed string as fallback
    }

    const cacheKey = `source_trust:${domain}`;
    const redis = this.redisService.getClient();

    // 1. Cache-first lookup in Redis
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as TrustScoreResult;
        this.logger.log(
          `Cache hit for domain trust score "${domain}": ${parsed.score}`,
        );
        return parsed;
      }
    } catch (err) {
      this.logger.warn(
        `Redis lookup failed for key "${cacheKey}": ${String(err)}`,
      );
    }

    let score = 50;
    let reason = 'Domeniu general neverificat explicit';

    // 2. Query Supabase sources table
    try {
      const { data: dbSource } = await this.supabaseService
        .getClient()
        .from('sources')
        .select('trust_score, name')
        .or(`url.eq.${domain},url.eq.${urlStr},url.ilike.%${domain}%`)
        .limit(1)
        .maybeSingle();

      if (dbSource) {
        const sourceData = dbSource as { trust_score: number; name: string };
        score = sourceData.trust_score;
        reason = `Scor definit în baza de date pentru sursa: ${sourceData.name}`;
      } else {
        // 3. Fallback domain rule matching
        if (domain.endsWith('.gov.ro') || domain.endsWith('.gov')) {
          score = 95;
          reason = 'Instituție guvernamentală de încredere';
        } else if (domain.endsWith('wikipedia.org')) {
          score = 80;
          reason = 'Enciclopedie colaborativă evaluată de comunitatea online';
        } else if (
          ['gov.ro', 'wikipedia.org', 'senat.ro', 'cdep.ro', 'gov.ro'].some(
            (trusted) => domain === trusted || domain.endsWith(`.${trusted}`),
          )
        ) {
          score = 90;
          reason = 'Sursă oficială/legislativă allowlistată';
        } else if (
          ['wikipedia.org', 'wikipedia.com'].some(
            (wiki) => domain === wiki || domain.endsWith(`.${wiki}`),
          )
        ) {
          score = 80;
          reason = 'Wikisite cu moderare comunitară activă';
        }
      }
    } catch (err) {
      this.logger.warn(
        `Database query for source trust failed: ${String(err)}`,
      );
    }

    const result: TrustScoreResult = { score, reason };

    // 4. Populate Redis cache with 1-hour expiration
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    } catch (err) {
      this.logger.warn(
        `Failed to write to Redis cache for key "${cacheKey}": ${String(err)}`,
      );
    }

    return result;
  }
}
