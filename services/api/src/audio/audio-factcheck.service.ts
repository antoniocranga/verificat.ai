import { Injectable, Logger } from '@nestjs/common';
import { EvidenceRetrievalService } from '../fact-checks/evidence-retrieval.service';
import {
  VerdictGenerationService,
  VerdictValue,
} from '../fact-checks/verdict-generation.service';
import { FactCheckPersistenceService } from '../fact-checks/fact-check-persistence.service';
import { MetricsService } from '../metrics/metrics.service';
import { AudioVerdictValue, ResultMessage } from './audio-protocol.types';

function mapVerdict(v: VerdictValue): AudioVerdictValue {
  switch (v) {
    case 'True':
    case 'Mostly True':
      return 'TRUE';
    case 'False':
    case 'Misleading':
      return 'FALSE';
    case 'Partially True':
      return 'UNCERTAIN';
    case 'Unverified':
    default:
      return 'UNVERIFIED';
  }
}

export type StreamingResult = Omit<ResultMessage, 'type'> & {
  claimId: string;
  reportId: string;
  status: 'true' | 'false' | 'uncertain';
  offset?: { start: number; end: number };
};

export type FactcheckResponse =
  | StreamingResult
  | { error: true; code: string; message: string };

@Injectable()
export class AudioFactcheckService {
  private readonly logger = new Logger(AudioFactcheckService.name);
  private readonly MIN_WORDS = 5;

  constructor(
    private readonly evidenceRetrieval: EvidenceRetrievalService,
    private readonly verdictGeneration: VerdictGenerationService,
    private readonly persistenceService: FactCheckPersistenceService,
    private readonly metrics: MetricsService,
  ) {}

  async check(
    text: string,
    segmentId: string,
    sessionId: string,
  ): Promise<FactcheckResponse | null> {
    const startTime = process.hrtime();
    this.logger.log('Starting fact-check call', { sessionId, segmentId });

    const words = text.trim().split(/\s+/);
    const hasCapitalized = /[A-ZĂÂÎȘȚ]/.test(text);

    if (words.length < this.MIN_WORDS && !hasCapitalized) {
      this.metrics.sttSegmentsDroppedTotal.inc({
        reason: 'no_entity_detected',
      });
      this.logger.log('Segment dropped', {
        sessionId,
        segmentId,
        reason: 'no_entity_detected',
      });
      return null;
    }

    try {
      const claim = { assertion: text, entities: [], qualifiers: [] };

      const evidence = await this.evidenceRetrieval.retrieveEvidence(claim);
      const verdict = await this.verdictGeneration.generateVerdict(
        claim,
        evidence,
      );

      // Persist via shared service — writes to Supabase with session_id
      const persisted = await this.persistenceService.persistCheckCycle({
        sessionId,
        claimText: text,
        verdict: verdict.verdict,
        confidenceScore: verdict.confidenceScore,
        explanation: verdict.explanation,
        evidence,
      });

      const sources = evidence
        .map((e) => e.articleUrl ?? e.url)
        .filter((u): u is string => Boolean(u));

      const topEvidence = evidence[0];
      const matchedFact = topEvidence ? topEvidence.snippet : null;

      let status: 'true' | 'false' | 'uncertain' = 'uncertain';
      if (verdict.verdict === 'True' || verdict.verdict === 'Mostly True') {
        status = 'true';
      } else if (
        verdict.verdict === 'False' ||
        verdict.verdict === 'Misleading'
      ) {
        status = 'false';
      }

      this.metrics.factcheckVerdictsTotal.inc({ status });

      const duration = process.hrtime(startTime);
      this.logger.log('Fact-check persisted', {
        sessionId,
        segmentId,
        claimId: persisted.claimId,
        verdictId: persisted.verdictId,
        status,
        latencyMs: Math.round(duration[0] * 1000 + duration[1] / 1e6),
      });

      this.metrics.factcheckRequestsTotal.inc({ outcome: 'success' });
      this.metrics.factcheckRequestDurationSeconds.observe(
        duration[0] + duration[1] / 1e9,
      );

      return {
        segmentId,
        verdict: mapVerdict(verdict.verdict),
        status,
        confidence: verdict.confidenceScore / 100,
        explanation: verdict.explanation,
        sources,
        matchedFact,
        claimId: persisted.claimId,
        reportId: persisted.verdictId,
      };
    } catch (err) {
      const duration = process.hrtime(startTime);
      this.logger.error('Fact-check failed', {
        sessionId,
        segmentId,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: Math.round(duration[0] * 1000 + duration[1] / 1e6),
      });

      this.metrics.factcheckRequestsTotal.inc({ outcome: 'error' });
      this.metrics.factcheckRequestDurationSeconds.observe(
        duration[0] + duration[1] / 1e9,
      );

      return {
        error: true,
        code: 'CLAIM_ERROR',
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
