/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { DeepgramSttAdapter } from './deepgram-stt.adapter';
import { firstValueFrom, take } from 'rxjs';

jest.mock('ws', () => {
  const mockOnHandlers: Record<string, (...args: any[]) => void> = {};
  const WebSocketMock = jest.fn().mockImplementation(() => ({
    readyState: 0,
    send: jest.fn(),
    close: jest.fn(),
    on: jest.fn((event: string, handler: (...args: any[]) => void) => {
      mockOnHandlers[event] = handler;
    }),
    _mockHandlers: mockOnHandlers,
  }));
  WebSocketMock.CONNECTING = 0;
  WebSocketMock.OPEN = 1;
  WebSocketMock.CLOSING = 2;
  WebSocketMock.CLOSED = 3;
  return { WebSocket: WebSocketMock };
});

const wsMock = jest.requireMock('ws');

describe('DeepgramSttAdapter', () => {
  let adapter: DeepgramSttAdapter;
  let globalFetchMock: jest.Mock;
  let mockWsInstance: any;

  function getWsInstance(): any {
    return (wsMock.WebSocket as jest.Mock).mock.results[0]?.value;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    mockWsInstance = null;

    globalFetchMock = jest.fn();
    (globalThis as any).fetch = globalFetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [DeepgramSttAdapter],
    }).compile();

    adapter = module.get<DeepgramSttAdapter>(DeepgramSttAdapter);
    delete process.env.DEEPGRAM_API_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fall back to MockDeepgramSession when no API key is set', async () => {
    const session = await adapter.startStream();
    expect(session.constructor.name).toBe('MockDeepgramSession');
  });

  it('should instantiate DeepgramSession and connect to WebSocket when API key is set', async () => {
    process.env.DEEPGRAM_API_KEY = 'test-dg-key';
    const sessionPromise = adapter.startStream({ language: 'ro-RO', sampleRate: 8000 });

    const inst = getWsInstance();
    inst.readyState = 1;
    inst._mockHandlers['open']();

    const session = await sessionPromise;
    expect(session.constructor.name).toBe('DeepgramSession');
    expect(wsMock.WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('api.deepgram.com/v1/listen?model=nova-2&language=ro&numerals=true&encoding=linear16&sample_rate=8000&interim_results=true&endpointing=300'),
      expect.objectContaining({ headers: { Authorization: 'Token test-dg-key' } })
    );
  });

  it('should map incoming WebSocket messages correctly to SttTranscriptEvent', async () => {
    process.env.DEEPGRAM_API_KEY = 'test-dg-key';
    const sessionPromise = adapter.startStream();

    const inst = getWsInstance();
    inst.readyState = 1;
    inst._mockHandlers['open']();

    const session = await sessionPromise;
    const transcriptPromise = firstValueFrom(session.getTranscript$().pipe(take(1)));

    const mockResponse = {
      channel: {
        alternatives: [{ transcript: '10 mere verzi', confidence: 0.98 }],
      },
      is_final: true,
    };

    inst._mockHandlers['message'](Buffer.from(JSON.stringify(mockResponse)));

    const event = await transcriptPromise;
    expect(event.text).toBe('10 mere verzi');
    expect(event.isFinal).toBe(true);
    expect(event.confidence).toBe(0.98);
    expect(event.language).toBe('ro-RO');
  });

  it('should close WebSocket connection gracefully on session close', async () => {
    process.env.DEEPGRAM_API_KEY = 'test-dg-key';
    const sessionPromise = adapter.startStream();

    const inst = getWsInstance();
    inst.readyState = 1;
    inst._mockHandlers['open']();

    const session = await sessionPromise;
    inst.readyState = 1;
    await session.close();

    expect(inst.close).toHaveBeenCalled();
  });

  describe('transcribeBuffer', () => {
    it('should return mock transcription if DEEPGRAM_API_KEY is missing', async () => {
      const res = await adapter.transcribeBuffer(Buffer.alloc(0));
      expect(res.text).toBe('Mock transcription from Deepgram batch');
      expect(globalFetchMock).not.toHaveBeenCalled();
    });

    it('should invoke fetch with correct params when API key is set', async () => {
      process.env.DEEPGRAM_API_KEY = 'test-key';
      globalFetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            channels: [{
              alternatives: [{ transcript: 'fetch test transcript', confidence: 0.95 }]
            }]
          }
        }),
      });

      const res = await adapter.transcribeBuffer(Buffer.alloc(0), { language: 'ro-RO' });
      expect(res.text).toBe('fetch test transcript');
      expect(res.confidence).toBe(0.95);
      expect(globalFetchMock).toHaveBeenCalledWith(
        expect.stringContaining('api.deepgram.com/v1/listen?model=nova-2&language=ro&smart_format=true'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Authorization': 'Token test-key' }),
        }),
      );
    });
  });
});