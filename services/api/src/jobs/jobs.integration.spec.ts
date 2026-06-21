/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsConsumer, FactVerificationJobData } from './jobs.consumer';
import { SpeechService } from '../speech/speech.service';
import { ClaimDetectionService } from '../fact-checks/claim-detection.service';
import { EvidenceRetrievalService } from '../fact-checks/evidence-retrieval.service';
import { VerdictGenerationService } from '../fact-checks/verdict-generation.service';
import { SourceTrustService } from '../sources/source-trust.service';
import { Job } from 'bullmq';

describe('JobsConsumer Integration', () => {
  let consumer: JobsConsumer;
  let claimDetectionService: jest.Mocked<ClaimDetectionService>;
  let evidenceRetrievalService: jest.Mocked<EvidenceRetrievalService>;
  let verdictGenerationService: jest.Mocked<VerdictGenerationService>;
  let sourceTrustService: jest.Mocked<SourceTrustService>;

  beforeEach(async () => {
    const mockSpeechService = {
      getAdapter: jest.fn().mockReturnValue({
        transcribeBuffer: jest.fn().mockResolvedValue({
          text: 'Mocked audio transcript text',
          confidence: 0.95,
        }),
      }),
    };

    const mockClaimDetectionService = {
      detectClaims: jest.fn().mockResolvedValue([
        {
          entities: ['Guvern'],
          assertion: 'Inflația a scăzut în 2023 la wikipedia.org',
          qualifiers: ['anul 2023'],
        },
      ]),
    };

    const mockEvidenceRetrievalService = {
      retrieveEvidence: jest.fn().mockResolvedValue([
        {
          title: 'Evidence Title',
          url: 'https://wikipedia.org',
          snippet: 'Information snippet',
          source: 'Allowlisted External Link',
          similarityScore: 0.85,
        },
      ]),
      getEmbedding: jest.fn(),
    };

    const mockVerdictGenerationService = {
      generateVerdict: jest.fn().mockResolvedValue({
        verdict: 'True',
        confidenceScore: 85,
        explanation: 'The claim is supported by the evidence.',
        citedSources: ['https://wikipedia.org'],
      }),
    };

    const mockSourceTrustService = {
      getSourceTrust: jest.fn().mockResolvedValue({
        score: 80,
        reason: 'Community moderated source',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsConsumer,
        { provide: SpeechService, useValue: mockSpeechService },
        { provide: ClaimDetectionService, useValue: mockClaimDetectionService },
        {
          provide: EvidenceRetrievalService,
          useValue: mockEvidenceRetrievalService,
        },
        {
          provide: VerdictGenerationService,
          useValue: mockVerdictGenerationService,
        },
        { provide: SourceTrustService, useValue: mockSourceTrustService },
      ],
    }).compile();

    consumer = module.get<JobsConsumer>(JobsConsumer);
    claimDetectionService = module.get(ClaimDetectionService);
    evidenceRetrievalService = module.get(EvidenceRetrievalService);
    verdictGenerationService = module.get(VerdictGenerationService);
    sourceTrustService = module.get(SourceTrustService);
  });

  it('should orchestrate the full fact verification pipeline from text input successfully', async () => {
    const mockJob = {
      id: 'job-123',
      data: {
        claimId: 'claim-abc',
        text: 'Inflația a scăzut în 2023 la wikipedia.org',
      },
    } as unknown as Job<FactVerificationJobData, unknown, string>;

    const result = await consumer.process(mockJob);

    expect(result.success).toBe(true);
    expect(result.transcript).toBeUndefined(); // Only populated when audio input is transcribed
    expect(claimDetectionService.detectClaims).toHaveBeenCalledWith(
      'Inflația a scăzut în 2023 la wikipedia.org',
    );
    expect(evidenceRetrievalService.retrieveEvidence).toHaveBeenCalled();
    expect(sourceTrustService.getSourceTrust).toHaveBeenCalledWith(
      'https://wikipedia.org',
    );
    expect(verdictGenerationService.generateVerdict).toHaveBeenCalled();

    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].assertion).toBe(
      'Inflația a scăzut în 2023 la wikipedia.org',
    );
    expect(result.claims[0].verdict).toBe('True');
    expect(result.claims[0].confidenceScore).toBe(85);
    expect(result.claims[0].evidence[0].trustScore).toBe(80);
  });
});
