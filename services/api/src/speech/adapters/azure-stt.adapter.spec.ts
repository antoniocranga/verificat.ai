/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AzureSttAdapter } from './azure-stt.adapter';
import * as https from 'https';
import { EventEmitter } from 'events';

jest.mock('https', () => {
  return {
    request: jest.fn(),
  };
});

describe('AzureSttAdapter', () => {
  let adapter: AzureSttAdapter;
  let mockRequest: jest.Mock;

  beforeEach(async () => {
    mockRequest = https.request as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureSttAdapter],
    }).compile();

    adapter = module.get<AzureSttAdapter>(AzureSttAdapter);
    delete process.env.AZURE_SPEECH_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fall back to mock batch transcription when no API key is set', async () => {
    const res = await adapter.transcribeBuffer(Buffer.alloc(0));
    expect(res.text).toContain('no API key');
    expect(res.confidence).toBe(0.95);
  });

  it('should invoke HTTPS request to Azure Speech endpoints when API key is set', async () => {
    process.env.AZURE_SPEECH_KEY = 'test-azure-key';
    process.env.AZURE_SPEECH_REGION = 'eastus';

    const clientRequest: any = new EventEmitter();
    clientRequest.write = jest.fn();
    clientRequest.end = jest.fn();

    const mockResponse: any = new EventEmitter();
    
    mockRequest.mockImplementation((options, cb) => {
      cb(mockResponse);
      return clientRequest;
    });

    const promise = adapter.transcribeBuffer(Buffer.from('audio-data'), { language: 'ro-RO' });

    // Verify request options
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: 'eastus.stt.speech.microsoft.com',
        path: expect.stringContaining('language=ro-RO'),
        headers: expect.objectContaining({
          'Ocp-Apim-Subscription-Key': 'test-azure-key',
        }),
      }),
      expect.any(Function),
    );

    // Simulate response data stream
    const mockApiResponse = {
      RecognitionStatus: 'Success',
      NBest: [
        {
          Display: 'Transcrierea corectă',
          Confidence: 0.97,
        },
      ],
    };

    mockResponse.emit('data', Buffer.from(JSON.stringify(mockApiResponse)));
    mockResponse.emit('end');

    const res = await promise;
    expect(res.text).toBe('Transcrierea corectă');
    expect(res.confidence).toBe(0.97);
  });
});
