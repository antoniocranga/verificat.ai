import { Injectable, Logger } from '@nestjs/common';
import { EvidenceRetrievalService } from '../fact-checks/evidence-retrieval.service';
import {
  VerdictGenerationService,
  VerdictValue,
} from '../fact-checks/verdict-generation.service';
import { AudioVerdictValue, ResultMessage } from './audio-protocol.types';

/**
 * Maps the 6-value Constitution verdict to the 4-value streaming protocol.
 * See AudioVerdictValue in audio-protocol.types.ts for the rationale.
 */
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

export type StreamingResult = Omit<ResultMessage, 'type'>;

@Injectable()
export class AudioFactcheckService {
  private readonly logger = new Logger(AudioFactcheckService.name);
  private readonly MIN_WORDS = 5;

  constructor(
    private readonly evidenceRetrieval: EvidenceRetrievalService,
    private readonly verdictGeneration: VerdictGenerationService,
  ) {}

  /**
   * Runs the fact-check pipeline on a committed transcript segment.
   * Returns null if the segment is too short to be worth checking.
   * Never throws — errors are logged and null is returned.
   */
  async check(
    text: string,
    segmentId: string,
  ): Promise<StreamingResult | null> {
    if (text.trim().split(/\s+/).length < this.MIN_WORDS) {
      this.logger.debug(
        `Segment ${segmentId} skipped — fewer than ${this.MIN_WORDS} words`,
      );
      return null;
    }

    try {
      // Build a NormalizedClaim from the raw transcript text.
      // The audio pipeline does not run claim-detection (that stage is for the batch flow).
      // We treat the entire utterance as the assertion to keep streaming latency low.
      const claim = { assertion: text, entities: [], qualifiers: [] };

      const evidence = await this.evidenceRetrieval.retrieveEvidence(claim);
      const verdict = await this.verdictGeneration.generateVerdict(
        claim,
        evidence,
      );

      const sources = evidence
        .map((e) => e.articleUrl ?? e.url)
        .filter((u): u is string => Boolean(u));

      // matchedFact: use the top-similarity evidence snippet as the "matched fact"
      const topEvidence = evidence[0];
      const matchedFact = topEvidence ? topEvidence.snippet : null;

      return {
        segmentId,
        verdict: mapVerdict(verdict.verdict),
        confidence: verdict.confidenceScore / 100,
        explanation: verdict.explanation,
        sources,
        matchedFact,
      };
    } catch (err) {
      this.logger.error(
        `Fact-check failed for segment ${segmentId}: ${String(err)}`,
      );
      return null;
    }
  }
}
