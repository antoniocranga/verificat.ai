/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AudioFactcheckService } from './audio-factcheck.service';
import { EvidenceRetrievalService } from '../fact-checks/evidence-retrieval.service';
import { VerdictGenerationService } from '../fact-checks/verdict-generation.service';

const makeEvidence = (overrides: Partial<Record<string, unknown>> = {}) => ({
  title: 'Sursa de test',
  url: 'https://example.com/stire',
  articleUrl: 'https://example.com/stire',
  snippet: 'Snippet de test pentru afirmație.',
  source: 'Example',
  similarityScore: 0.88,
  ...overrides,
});

const makeVerdict = (overrides: Partial<Record<string, unknown>> = {}) => ({
  verdict: 'True' as const,
  confidenceScore: 82,
  explanation: 'Explicație de test.',
  citedSources: ['https://example.com/stire'],
  ...overrides,
});

describe('AudioFactcheckService', () => {
  let service: AudioFactcheckService;
  let evidenceRetrieval: jest.Mocked<EvidenceRetrievalService>;
  let verdictGeneration: jest.Mocked<VerdictGenerationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioFactcheckService,
        {
          provide: EvidenceRetrievalService,
          useValue: {
            retrieveEvidence: jest.fn().mockResolvedValue([makeEvidence()]),
          },
        },
        {
          provide: VerdictGenerationService,
          useValue: {
            generateVerdict: jest.fn().mockResolvedValue(makeVerdict()),
          },
        },
      ],
    }).compile();

    service = module.get<AudioFactcheckService>(AudioFactcheckService);
    evidenceRetrieval = module.get(EvidenceRetrievalService);
    verdictGeneration = module.get(VerdictGenerationService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── Word-count guard ────────────────────────────────────────────────────

  it('returns null for segments shorter than 5 words', async () => {
    const result = await service.check('Scurt.', 'seg-001');
    expect(result).toBeNull();
    expect(evidenceRetrieval.retrieveEvidence).not.toHaveBeenCalled();
  });

  it('returns null for a four-word segment', async () => {
    const result = await service.check('Unu doi trei patru', 'seg-002');
    expect(result).toBeNull();
  });

  it('processes a segment that meets the 5-word minimum', async () => {
    const result = await service.check('Unu doi trei patru cinci', 'seg-003');
    expect(result).not.toBeNull();
    expect(evidenceRetrieval.retrieveEvidence).toHaveBeenCalledTimes(1);
  });

  // ─── Verdict mapping ─────────────────────────────────────────────────────

  it.each([
    ['True', 'TRUE'],
    ['Mostly True', 'TRUE'],
    ['False', 'FALSE'],
    ['Misleading', 'FALSE'],
    ['Partially True', 'UNCERTAIN'],
    ['Unverified', 'UNVERIFIED'],
  ] as const)(
    'maps "%s" → "%s" in the streaming protocol',
    async (input, expected) => {
      verdictGeneration.generateVerdict.mockResolvedValue(
        makeVerdict({ verdict: input }),
      );
      const result = await service.check(
        'Acesta este un text suficient de lung',
        'seg-map',
      );
      expect(result?.verdict).toBe(expected);
    },
  );

  // ─── Result shape ────────────────────────────────────────────────────────

  it('populates confidence as a 0–1 fraction from the 0–100 score', async () => {
    verdictGeneration.generateVerdict.mockResolvedValue(
      makeVerdict({ confidenceScore: 75 }),
    );
    const result = await service.check(
      'Deficitul bugetar al României a crescut semnificativ',
      'seg-conf',
    );
    expect(result?.confidence).toBeCloseTo(0.75);
  });

  it('carries the segmentId through to the result', async () => {
    const result = await service.check(
      'Premierul a declarat că economia este stabilă',
      'my-segment-id',
    );
    expect(result?.segmentId).toBe('my-segment-id');
  });

  it('picks the top evidence snippet as matchedFact', async () => {
    evidenceRetrieval.retrieveEvidence.mockResolvedValue([
      makeEvidence({ snippet: 'Snippet principal' }),
      makeEvidence({ snippet: 'Al doilea snippet' }),
    ]);
    const result = await service.check(
      'Producția industrială a scăzut față de anul trecut',
      'seg-top',
    );
    expect(result?.matchedFact).toBe('Snippet principal');
  });

  it('sets matchedFact to null when evidence is empty but verdict is still returned', async () => {
    evidenceRetrieval.retrieveEvidence.mockResolvedValue([]);
    verdictGeneration.generateVerdict.mockResolvedValue(
      makeVerdict({ verdict: 'Unverified', confidenceScore: 0 }),
    );
    const result = await service.check(
      'Inflația anuală a depășit pragul de cinci procente',
      'seg-empty-ev',
    );
    expect(result?.matchedFact).toBeNull();
  });

  it('extracts articleUrl from evidence for sources array', async () => {
    evidenceRetrieval.retrieveEvidence.mockResolvedValue([
      makeEvidence({ articleUrl: 'https://gov.ro/stire', url: 'https://gov.ro' }),
    ]);
    const result = await service.check(
      'Legea bugetului a fost adoptată de Parlament ieri',
      'seg-url',
    );
    expect(result?.sources).toContain('https://gov.ro/stire');
  });

  // ─── Error resilience ────────────────────────────────────────────────────

  it('returns null (does not throw) when EvidenceRetrievalService throws', async () => {
    evidenceRetrieval.retrieveEvidence.mockRejectedValue(
      new Error('DB connection failed'),
    );
    const result = await service.check(
      'Ministrul a anunțat o nouă politică fiscală importantă',
      'seg-err',
    );
    expect(result).toBeNull();
  });

  it('returns null (does not throw) when VerdictGenerationService throws', async () => {
    verdictGeneration.generateVerdict.mockRejectedValue(
      new Error('OpenAI rate limit'),
    );
    const result = await service.check(
      'Rata inflației a scăzut pentru prima dată din 2020',
      'seg-llm-err',
    );
    expect(result).toBeNull();
  });
});
