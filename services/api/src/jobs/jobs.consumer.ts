/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SpeechService } from '../speech/speech.service';
import {
  ClaimDetectionService,
  NormalizedClaim,
} from '../fact-checks/claim-detection.service';
import {
  EvidenceRetrievalService,
  EvidenceResult,
} from '../fact-checks/evidence-retrieval.service';
import {
  VerdictGenerationService,
  VerdictValue,
} from '../fact-checks/verdict-generation.service';
import { FactCheckPersistenceService } from '../fact-checks/fact-check-persistence.service';
import { SourceTrustService } from '../sources/source-trust.service';
import { SessionsService } from '../sessions/sessions.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface FactVerificationJobData {
  claimId: string;
  text?: string;
  audioPath?: string;
  preferredEngine?: 'deepgram' | 'azure' | 'whisper';
  sessionId?: string;
}

export interface FactVerificationJobResult {
  success: boolean;
  transcript?: string;
  claims: Array<{
    claimId: string;
    text: string;
    status: 'true' | 'false' | 'uncertain';
    confidence: number;
    offset: {
      start: number;
      end: number;
    };
    reportId: string;
  }>;
}

@Processor('fact-verification')
export class JobsConsumer extends WorkerHost {
  private readonly logger = new Logger(JobsConsumer.name);

  constructor(
    private readonly speechService: SpeechService,
    private readonly claimDetectionService: ClaimDetectionService,
    private readonly evidenceRetrievalService: EvidenceRetrievalService,
    private readonly verdictGenerationService: VerdictGenerationService,
    private readonly persistenceService: FactCheckPersistenceService,
    private readonly sourceTrustService: SourceTrustService,
    private readonly sessionsService: SessionsService,
    private readonly supabaseService: SupabaseService,
  ) {
    super();
  }

  async process(
    job: Job<FactVerificationJobData>,
  ): Promise<FactVerificationJobResult> {
    const startTime = Date.now();
    this.logger.log(`Processing job ${job.id} for claimId ${job.data.claimId}`);
    const { sessionId } = job.data;

    let textToAnalyze = job.data.text || '';

    await job.updateProgress({ stage: 'speech', progress: 0 });

    if (job.data.audioPath) {
      this.logger.log(`Transcribing audio file from: ${job.data.audioPath}`);
      try {
        const audioBuffer = fs.readFileSync(job.data.audioPath);
        const adapter = this.speechService.getAdapter(job.data.preferredEngine);
        const transcriptResult = await adapter.transcribeBuffer(audioBuffer);
        textToAnalyze = transcriptResult.text;
        this.logger.log(`Audio transcription completed successfully.`);
      } catch (err) {
        this.logger.error(`Audio transcription failed: ${String(err)}`);
        throw err;
      }
    }

    await job.updateProgress({ stage: 'speech', progress: 100 });

    if (!textToAnalyze.trim()) {
      this.logger.warn(`No text or audio content provided for job ${job.id}`);
      return {
        success: true,
        claims: [],
      };
    }

    if (textToAnalyze.toLowerCase().includes('fail')) {
      this.logger.warn(`Simulating job failure for text containing 'fail'`);
      throw new Error('Intentional job failure for DLQ testing');
    }

    this.logger.log(`Detecting claims in input text...`);
    await job.updateProgress({ stage: 'claim_detection', progress: 0 });
    const detectedClaims =
      await this.claimDetectionService.detectClaims(textToAnalyze);
    this.logger.log(`Detected ${detectedClaims.length} claim(s).`);
    await job.updateProgress({ stage: 'claim_detection', progress: 100 });

    const internalClaimsResults: Array<{
      claimId: string;
      claim: NormalizedClaim;
      verdict: VerdictValue;
      confidenceScore: number;
      explanation: string;
      evidence: Array<
        EvidenceResult & { trustScore?: number; trustReason?: string }
      >;
    }> = [];

    for (let i = 0; i < detectedClaims.length; i++) {
      const claim = detectedClaims[i];
      const claimProgress = Math.round((i / detectedClaims.length) * 100);

      this.logger.log(
        `Retrieving evidence for claim: "${claim.assertion.substring(0, 50)}..."`,
      );
      await job.updateProgress({
        stage: 'evidence_retrieval',
        progress: claimProgress,
        claim: claim.assertion.substring(0, 50),
      });
      const rawEvidence =
        await this.evidenceRetrievalService.retrieveEvidence(claim);

      const evidenceWithTrust: Array<
        EvidenceResult & { trustScore?: number; trustReason?: string }
      > = [];
      for (const item of rawEvidence) {
        if (item.url) {
          try {
            const trust = await this.sourceTrustService.getSourceTrust(
              item.url,
            );
            evidenceWithTrust.push({
              ...item,
              trustScore: trust.score,
              trustReason: trust.reason,
            });
          } catch (err) {
            this.logger.warn(
              `Failed to score source trust for URL "${item.url}": ${String(err)}`,
            );
            evidenceWithTrust.push(item);
          }
        } else {
          evidenceWithTrust.push(item);
        }
      }

      this.logger.log(`Generating verdict for claim...`);
      await job.updateProgress({
        stage: 'verdict_generation',
        progress: claimProgress,
      });
      const verdictResult = await this.verdictGenerationService.generateVerdict(
        claim,
        rawEvidence,
      );

      const claimId =
        i === 0 && job.data.claimId ? job.data.claimId : crypto.randomUUID();

      internalClaimsResults.push({
        claimId,
        claim,
        verdict: verdictResult.verdict,
        confidenceScore: verdictResult.confidenceScore,
        explanation: verdictResult.explanation,
        evidence: evidenceWithTrust,
      });
    }

    // Persist via shared service — replaces inline Supabase writes
    const persistedResults: Array<{
      claimId: string;
      verdictId: string;
      verdict: VerdictValue;
      confidenceScore: number;
      explanation: string;
    }> = [];

    for (const internalRes of internalClaimsResults) {
      try {
        const persisted = await this.persistenceService.persistCheckCycle({
          sessionId,
          claimText: internalRes.claim.assertion,
          verdict: internalRes.verdict,
          confidenceScore: internalRes.confidenceScore,
          explanation: internalRes.explanation,
          evidence: internalRes.evidence,
        });
        persistedResults.push({
          claimId: persisted.claimId,
          verdictId: persisted.verdictId,
          verdict: internalRes.verdict,
          confidenceScore: internalRes.confidenceScore,
          explanation: internalRes.explanation,
        });
      } catch (err) {
        this.logger.error(
          `Failed to persist check cycle for claim ${internalRes.claimId}: ${String(err)}`,
        );
      }
    }

    // If this is a recording-mode session, finalize it now
    if (sessionId) {
      await this.sessionsService
        .updateSessionOnDisconnect(
          sessionId,
          persistedResults.map((r) => ({ verdict: r.verdict })),
        )
        .catch((err) =>
          this.logger.warn(
            `Failed to finalize session ${sessionId}: ${err.message}`,
          ),
        );
    }

    // Offset mapping & building return payload
    const finalClaims: FactVerificationJobResult['claims'] = [];
    let lastSearchIndex = 0;

    for (let i = 0; i < internalClaimsResults.length; i++) {
      const internalRes = internalClaimsResults[i];
      const persisted = persistedResults[i];
      if (!persisted) continue;

      const textToSearch =
        internalRes.claim.exactQuote || internalRes.claim.assertion;

      let start = textToAnalyze.indexOf(textToSearch, lastSearchIndex);
      if (start === -1 && lastSearchIndex > 0) {
        start = textToAnalyze.indexOf(textToSearch, 0);
      }

      if (start !== -1) {
        const end = start + textToSearch.length;
        if (start < end && end <= textToAnalyze.length) {
          lastSearchIndex = end;

          let mappedStatus: 'true' | 'false' | 'uncertain' = 'uncertain';
          if (
            internalRes.verdict === 'True' ||
            internalRes.verdict === 'Mostly True'
          ) {
            mappedStatus = 'true';
          } else if (
            internalRes.verdict === 'False' ||
            internalRes.verdict === 'Misleading'
          ) {
            mappedStatus = 'false';
          } else {
            mappedStatus = 'uncertain';
          }

          finalClaims.push({
            claimId: persisted.claimId,
            text: textToSearch,
            status: mappedStatus,
            confidence: internalRes.confidenceScore,
            offset: {
              start,
              end,
            },
            reportId: persisted.verdictId,
          });
        } else {
          this.logger.warn(
            `Invalid offset bounds for claim ${internalRes.claimId}: start=${start}, end=${end}. Discarding claim from final payload.`,
          );
        }
      } else {
        this.logger.warn(
          `Could not locate exactQuote or assertion in text for claim ${internalRes.claimId}. Discarding from final payload.`,
        );
      }
    }

    // 5. Insert usage log
    try {
      const supabase = this.supabaseService.getClient();
      const durationMs = Date.now() - startTime;
      await supabase.from('usage_logs').insert({
        service: job.data.audioPath
          ? 'audio_fact_verification'
          : 'text_fact_verification',
        duration_ms: durationMs,
        metadata: {
          jobId: job.id,
          claimsCount: internalClaimsResults.length,
          returnedClaimsCount: finalClaims.length,
          engine: job.data.preferredEngine,
        },
      } as never);
    } catch (dbErr) {
      this.logger.error(`Failed to save usage log: ${String(dbErr)}`);
    }

    return {
      success: true,
      transcript: job.data.audioPath ? textToAnalyze : undefined,
      claims: finalClaims,
    };
  }
}
