/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ClaimDetectionService } from './claim-detection.service';
import * as https from 'https';
import { EventEmitter } from 'events';

jest.mock('https', () => {
  return {
    request: jest.fn(),
  };
});

describe('ClaimDetectionService', () => {
  let service: ClaimDetectionService;
  let mockRequest: jest.Mock;

  beforeEach(async () => {
    mockRequest = https.request as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimDetectionService],
    }).compile();

    service = module.get<ClaimDetectionService>(ClaimDetectionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should mock local test environment paths correctly', async () => {
    const claims = await service.detectClaims('Test text containing deficitul bugetar');
    expect(claims.length).toBe(1);
    expect(claims[0].assertion).toContain('Deficitul bugetar');
  });

  it('should invoke OpenAI Chat Completions API with the correct payload', async () => {
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
      const promise = service.detectClaims('Deficitul a crescut.');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-openai-key',
            'Content-Type': 'application/json',
          }),
        }),
        expect.any(Function),
      );

      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                claims: [
                  {
                    entities: ['deficit'],
                    assertion: 'Deficitul a crescut.',
                    qualifiers: [],
                  },
                ],
              }),
            },
          },
        ],
      };

      mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
      mockResponse.emit('end');

      const res = await promise;
      expect(res.length).toBe(1);
      expect(res[0].assertion).toBe('Deficitul a crescut.');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      delete process.env.OPENAI_API_KEY;
    }
  });
});
