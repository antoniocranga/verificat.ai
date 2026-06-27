/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { VerdictGenerationService } from './verdict-generation.service';
import * as https from 'https';
import { EventEmitter } from 'events';

jest.mock('https', () => {
  return {
    request: jest.fn(),
  };
});

describe('VerdictGenerationService', () => {
  let service: VerdictGenerationService;
  let mockRequest: jest.Mock;

  beforeEach(async () => {
    mockRequest = https.request as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [VerdictGenerationService],
    }).compile();

    service = module.get<VerdictGenerationService>(VerdictGenerationService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should immediately return Unverified with 0 score if evidence is empty', async () => {
    const claim = {
      entities: ['test'],
      assertion: 'Test assertion',
      qualifiers: [],
    };
    const result = await service.generateVerdict(claim, []);
    expect(result.verdict).toBe('Unverified');
    expect(result.confidenceScore).toBe(0);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should call OpenAI Chat Completions API and parse a successful verdict response', async () => {
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
      const claim = {
        entities: ['deficit'],
        assertion: 'Deficitul a crescut.',
        qualifiers: [],
      };
      const evidence = [
        {
          title: 'Evidence 1',
          url: 'https://gov.ro/stire',
          snippet: 'Deficitul bugetar a inregistrat o crestere.',
          source: 'Gov.ro',
          similarityScore: 0.85,
        },
      ];

      const promise = service.generateVerdict(claim, evidence);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          method: 'POST',
        }),
        expect.any(Function),
      );

      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                verdict: 'True',
                confidenceScore: 85,
                explanation: 'Raportul confirma cresterea.',
                citedSources: ['https://gov.ro/stire'],
              }),
            },
          },
        ],
      };

      mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
      mockResponse.emit('end');

      const res = await promise;
      expect(res.verdict).toBe('True');
      expect(res.confidenceScore).toBe(85);
      expect(res.citedSources).toContain('https://gov.ro/stire');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('should override verdict to Unverified if confidence score is below 60 threshold', async () => {
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
      const claim = {
        entities: ['unverifiable'],
        assertion: 'Some vague claim.',
        qualifiers: [],
      };
      const evidence = [
        {
          title: 'Vague snippet',
          url: 'https://example.com',
          snippet: 'Vague context that does not really match.',
          source: 'Example',
          similarityScore: 0.5,
        },
      ];

      const promise = service.generateVerdict(claim, evidence);

      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                verdict: 'Mostly True',
                confidenceScore: 45, // Below 60 threshold
                explanation: 'Dovezi neclare.',
                citedSources: [],
              }),
            },
          },
        ],
      };

      mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
      mockResponse.emit('end');

      const res = await promise;
      expect(res.verdict).toBe('Unverified');
      expect(res.confidenceScore).toBe(45);
      expect(res.explanation).toContain('Grad scăzut de certitudine');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      delete process.env.OPENAI_API_KEY;
    }
  });
});
