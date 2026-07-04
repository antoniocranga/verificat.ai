/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsConsumer, FactVerificationJobData } from './jobs.consumer';
import { SpeechService } from '../speech/speech.service';
import { ClaimDetectionService } from '../fact-checks/claim-detection.service';
import { EvidenceRetrievalService } from '../fact-checks/evidence-retrieval.service';
import { VerdictGenerationService } from '../fact-checks/verdict-generation.service';
import { FactCheckPersistenceService } from '../fact-checks/fact-check-persistence.service';
import { SourceTrustService } from '../sources/source-trust.service';
import { SessionsService } from '../sessions/sessions.service';
import { SupabaseService } from '../supabase/supabase.service';
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
          exactQuote: 'Inflația a scăzut în 2023 la wikipedia.org',
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
        {
          provide: FactCheckPersistenceService,
          useValue: {
            persistCheckCycle: jest.fn().mockResolvedValue({
              claimId: 'mock-claim-id',
              factCheckId: 'mock-factcheck-id',
              verdictId: 'mock-verdict-id',
              sourceIds: ['mock-source-id'],
            }),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            updateSessionOnDisconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              from: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              maybeSingle: jest.fn().mockResolvedValue({ data: null }),
            }),
          },
        },
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
      updateProgress: jest.fn().mockResolvedValue(undefined),
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
    expect(result.claims[0].text).toBe(
      'Inflația a scăzut în 2023 la wikipedia.org',
    );
    expect(result.claims[0].status).toBe('true');
    expect(result.claims[0].confidence).toBe(85);
    expect(result.claims[0].offset.start).toBe(0);
    expect(result.claims[0].offset.end).toBe(42);
    expect(result.claims[0].reportId).toBeDefined();
    expect(result.claims[0].claimId).toBeDefined();
  });

  it('should match claims chronologically when quotes appear multiple times', async () => {
    claimDetectionService.detectClaims.mockResolvedValueOnce([
      {
        entities: ['Test'],
        assertion: 'test claim',
        exactQuote: 'repeat',
        qualifiers: [],
      },
      {
        entities: ['Test2'],
        assertion: 'test claim 2',
        exactQuote: 'repeat',
        qualifiers: [],
      },
    ]);

    const mockJob = {
      id: 'job-124',
      data: {
        claimId: 'claim-def',
        text: 'some repeat and another repeat here',
      },
      updateProgress: jest.fn().mockResolvedValue(undefined),
    } as unknown as Job<FactVerificationJobData, unknown, string>;

    const result = await consumer.process(mockJob);

    expect(result.claims).toHaveLength(2);
    expect(result.claims[0].text).toBe('repeat');
    expect(result.claims[0].offset.start).toBe(5);
    expect(result.claims[0].offset.end).toBe(11);
    expect(result.claims[1].text).toBe('repeat');
    expect(result.claims[1].offset.start).toBe(24);
    expect(result.claims[1].offset.end).toBe(30);
  });

  it('should reject and not return claims where exact quote cannot be found', async () => {
    claimDetectionService.detectClaims.mockResolvedValueOnce([
      {
        entities: ['Missing'],
        assertion: 'this claim is not in the text',
        exactQuote: 'totally fabricated quote',
        qualifiers: [],
      },
    ]);

    const mockJob = {
      id: 'job-125',
      data: {
        claimId: 'claim-ghi',
        text: 'the text does not contain the fabricated quote',
      },
      updateProgress: jest.fn().mockResolvedValue(undefined),
    } as unknown as Job<FactVerificationJobData, unknown, string>;

    const result = await consumer.process(mockJob);

    expect(result.claims).toHaveLength(0); // Should be filtered out
  });
});
