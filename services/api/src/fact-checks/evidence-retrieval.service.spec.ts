/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceRetrievalService } from './evidence-retrieval.service';
import { SearchService } from '../search/search.service';
import { SafeFetcherService } from '../common/safe-fetcher/safe-fetcher.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as https from 'https';
import { EventEmitter } from 'events';

jest.mock('https', () => {
  return {
    request: jest.fn(),
  };
});

describe('EvidenceRetrievalService', () => {
  let service: EvidenceRetrievalService;
  let searchService: jest.Mocked<SearchService>;
  let safeFetcherService: jest.Mocked<SafeFetcherService>;
  let supabaseService: jest.Mocked<SupabaseService>;
  let mockRequest: jest.Mock;

  beforeEach(async () => {
    mockRequest = https.request as jest.Mock;

    const mockSearchService = {
      searchSimilarClaims: jest.fn().mockResolvedValue([
        { text: 'Mock similar claim', similarity: 0.85 },
      ]),
      insertEmbedding: jest.fn(),
    };

    const mockSafeFetcherService = {
      fetchSafe: jest.fn().mockImplementation((url: string) => {
        if (url.includes('malicious') || url.includes('127.0.0.1')) {
          return Promise.reject(new Error('Blocked IP or Domain'));
        }
        return Promise.resolve('<html><body>Content from allowlisted site</body></html>');
      }),
      validateUrl: jest.fn(),
      isPrivateIp: jest.fn(),
    };

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [{ id: '1', text: 'Database match' }],
        error: null,
      }),
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceRetrievalService,
        { provide: SearchService, useValue: mockSearchService },
        { provide: SafeFetcherService, useValue: mockSafeFetcherService },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<EvidenceRetrievalService>(EvidenceRetrievalService);
    searchService = module.get(SearchService);
    safeFetcherService = module.get(SafeFetcherService);
    supabaseService = module.get(SupabaseService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run in test environment returning mock embeddings', async () => {
    const embedding = await service.getEmbedding('test assertion');
    expect(embedding.length).toBe(1536);
    expect(embedding[0]).toBe(0.1);
  });

  it('should call OpenAI embeddings API in non-test mode', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const clientRequest: any = new EventEmitter();
    clientRequest.write = jest.fn();
    clientRequest.end = jest.fn();

    const mockResponse: any = new EventEmitter();
    mockResponse.statusCode = 200;

    mockRequest.mockImplementation((options, cb) => {
      cb(mockResponse);
      return clientRequest;
    });

    try {
      const promise = service.getEmbedding('Factual assertion');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'api.openai.com',
          path: '/v1/embeddings',
          method: 'POST',
        }),
        expect.any(Function),
      );

      const mockApiResponse = {
        data: [
          {
            embedding: new Array(1536).fill(0.9),
          },
        ],
      };

      mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
      mockResponse.emit('end');

      const res = await promise;
      expect(res.length).toBe(1536);
      expect(res[0]).toBe(0.9);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('should retrieve evidence including pgvector, database keywords, and safe URL fetches', async () => {
    const claim = {
      entities: ['deficit'],
      assertion: 'Deficitul bugetar a crescut la https://gov.ro/stire',
      qualifiers: ['anul 2023'],
    };

    const results = await service.retrieveEvidence(claim);

    // Assert pgvector search was called
    expect(searchService.searchSimilarClaims).toHaveBeenCalled();

    // Assert keyword database search was called
    expect(supabaseService.getClient).toHaveBeenCalled();

    // Assert safe fetcher was called for the URL in assertion
    expect(safeFetcherService.fetchSafe).toHaveBeenCalledWith('https://gov.ro/stire');

    // Assert merge and ranking works
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarityScore).toBeGreaterThanOrEqual(results[results.length - 1].similarityScore);
  });

  it('should fail gracefully and skip blocked/internal URLs during safe fetches', async () => {
    const claim = {
      entities: ['test'],
      assertion: 'Scan this malicious link http://127.0.0.1/admin',
      qualifiers: [],
    };

    const results = await service.retrieveEvidence(claim);

    // Verify it attempted fetch but failed/skipped and did not crash the pipeline
    expect(safeFetcherService.fetchSafe).toHaveBeenCalledWith('http://127.0.0.1/admin');
    
    // Ensure no result includes the internal domain since it threw an error
    const webResults = results.filter((r) => r.url === 'http://127.0.0.1/admin');
    expect(webResults.length).toBe(0);
  });
});
