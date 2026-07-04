import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { VerdictValue } from './verdict-generation.service';
import { EvidenceResult } from './evidence-retrieval.service';
import * as crypto from 'crypto';

export interface PersistCheckCycleParams {
  sessionId?: string;
  claimText: string;
  claimLanguage?: string;
  verdict: VerdictValue;
  confidenceScore: number;
  explanation: string;
  evidence: EvidenceResult[];
}

export interface PersistCheckCycleResult {
  claimId: string;
  factCheckId: string;
  verdictId: string;
  sourceIds: string[];
}

@Injectable()
export class FactCheckPersistenceService {
  private readonly logger = new Logger(FactCheckPersistenceService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async persistCheckCycle(
    params: PersistCheckCycleParams,
  ): Promise<PersistCheckCycleResult> {
    const {
      sessionId,
      claimText,
      claimLanguage,
      verdict,
      confidenceScore,
      explanation,
      evidence,
    } = params;
    const client = this.supabaseService.getClient();

    const claimId = crypto.randomUUID();
    const factCheckId = crypto.randomUUID();
    const verdictId = crypto.randomUUID();
    const sourceIds: string[] = [];

    try {
      // 1. Insert claim
      const claimPayload: Record<string, unknown> = {
        id: claimId,
        text: claimText,
        language: claimLanguage || 'ro',
      };
      if (sessionId) {
        claimPayload.session_id = sessionId;
      }
      await client.from('claims').insert(claimPayload as never);

      // 2. Insert fact check
      await client.from('fact_checks').insert({
        id: factCheckId,
        claim_id: claimId,
        status: 'completed',
      } as never);

      // 3. Insert verdict
      await client.from('verdicts').insert({
        id: verdictId,
        fact_check_id: factCheckId,
        verdict,
        confidence_score: confidenceScore,
        explanation,
      } as never);

      // 4. Insert sources and verdict_sources
      for (const item of evidence) {
        if (!item.url) continue;

        let sourceId = item.sourceId;
        if (!sourceId) {
          const { data: existingSource } = (await client
            .from('sources')
            .select('id')
            .eq('url', item.url)
            .maybeSingle()) as never;

          if (existingSource) {
            sourceId = (existingSource as { id: string }).id;
          } else {
            sourceId = crypto.randomUUID();
            await client.from('sources').insert({
              id: sourceId,
              name: item.sourceName || item.source || 'Unknown',
              url: item.url,
            } as never);
          }
        }

        sourceIds.push(sourceId);

        await client
          .from('verdict_sources')
          .insert({
            verdict_id: verdictId,
            source_id: sourceId,
          } as never)
          .select()
          .maybeSingle();
      }
    } catch (err) {
      this.logger.error(`Failed to persist check cycle: ${String(err)}`);
      throw err;
    }

    return { claimId, factCheckId, verdictId, sourceIds };
  }
}
