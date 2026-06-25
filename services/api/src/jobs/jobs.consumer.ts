import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SpeechService } from '../speech/speech.service';
import { ClaimDetectionService } from '../fact-checks/claim-detection.service';
import {
  EvidenceRetrievalService,
  EvidenceResult,
} from '../fact-checks/evidence-retrieval.service';
import {
  VerdictGenerationService,
  VerdictValue,
} from '../fact-checks/verdict-generation.service';
import { SourceTrustService } from '../sources/source-trust.service';
import * as fs from 'fs';

export interface FactVerificationJobData {
  claimId: string;
  text?: string;
  audioPath?: string;
  preferredEngine?: 'deepgram' | 'azure' | 'whisper';
}

export interface FactVerificationJobResult {
  success: boolean;
  transcript?: string;
  claims: Array<{
    assertion: string;
    verdict: VerdictValue;
    confidenceScore: number;
    explanation: string;
    evidence: Array<{
      title: string;
      url: string;
      snippet: string;
      source: string;
      similarityScore: number;
      trustScore?: number;
      trustReason?: string;
      sourceId?: string;
      sourceName?: string;
      articleUrl?: string;
      publishedAt?: string;
    }>;
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
    private readonly sourceTrustService: SourceTrustService,
  ) {
    super();
  }

  async process(
    job: Job<FactVerificationJobData>,
  ): Promise<FactVerificationJobResult> {
    this.logger.log(`Processing job ${job.id} for claimId ${job.data.claimId}`);

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

    const claimsResults: FactVerificationJobResult['claims'] = [];

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

      claimsResults.push({
        assertion: claim.assertion,
        verdict: verdictResult.verdict,
        confidenceScore: verdictResult.confidenceScore,
        explanation: verdictResult.explanation,
        evidence: evidenceWithTrust.map((e) => ({
          title: e.title,
          url: e.url,
          snippet: e.snippet,
          source: e.source,
          similarityScore: e.similarityScore,
          trustScore: e.trustScore,
          trustReason: e.trustReason,
          sourceId: e.sourceId,
          sourceName: e.sourceName,
          articleUrl: e.articleUrl,
          publishedAt: e.publishedAt,
        })),
      });
    }

    return {
      success: true,
      transcript: job.data.audioPath ? textToAnalyze : undefined,
      claims: claimsResults,
    };
  }
}
