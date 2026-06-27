/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { WhisperSttAdapter } from './whisper-stt.adapter';
import * as http from 'http';
import { EventEmitter } from 'events';

jest.mock('http', () => {
  return {
    request: jest.fn(),
  };
});

describe('WhisperSttAdapter', () => {
  let adapter: WhisperSttAdapter;
  let mockRequest: jest.Mock;

  beforeEach(async () => {
    mockRequest = http.request as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WhisperSttAdapter],
    }).compile();

    adapter = module.get<WhisperSttAdapter>(WhisperSttAdapter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should invoke HTTP request to Whisper endpoints', async () => {
    const clientRequest: any = new EventEmitter();
    clientRequest.write = jest.fn();
    clientRequest.end = jest.fn();

    const mockResponse: any = new EventEmitter();
    
    mockRequest.mockImplementation((options, cb) => {
      cb(mockResponse);
      return clientRequest;
    });

    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const promise = adapter.transcribeBuffer(Buffer.from('audio-data'), { language: 'ro-RO' });

      // Verify request options
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'verificat-whisper',
          port: '9000',
          path: expect.stringContaining('language=ro'),
          method: 'POST',
        }),
        expect.any(Function),
      );

      // Simulate response data stream
      const mockApiResponse = {
        text: 'Transcrierea locala offline',
      };

      mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
      mockResponse.emit('end');

      const res = await promise;
      expect(res.text).toBe('Transcrierea locala offline');
      expect(res.confidence).toBe(0.90);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
