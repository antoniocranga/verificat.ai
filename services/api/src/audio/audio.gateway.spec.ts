/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter } from 'events';
import { AudioGateway } from './audio.gateway';
import { SpeechService } from '../speech/speech.service';
import { AudioFactcheckService } from './audio-factcheck.service';
import { WebSocket } from 'ws';
import { Subject } from 'rxjs';

/**
 * Creates a minimal mock WebSocket with just enough surface for AudioGateway.
 * OPEN = 1 (per the WS spec).
 */
function makeMockWs(readyState = WebSocket.OPEN): jest.Mocked<WebSocket> {
  const ee = new EventEmitter();
  return Object.assign(ee, {
    readyState,
    send: jest.fn(),
    close: jest.fn(),
    on: ee.on.bind(ee),
  }) as unknown as jest.Mocked<WebSocket>;
}

/**
 * Builds a mock SttSession backed by an RxJS Subject so tests can
 * imperatively emit transcript events.
 */
function makeMockSttSession() {
  const subject$ = new Subject<{
    text: string;
    isFinal: boolean;
    confidence: number;
    language: string;
  }>();
  return {
    sendAudio: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    getTranscript$: jest.fn().mockReturnValue(subject$.asObservable()),
    subject$,
  };
}

describe('AudioGateway', () => {
  let gateway: AudioGateway;
  let speechService: jest.Mocked<SpeechService>;
  let factcheck: jest.Mocked<AudioFactcheckService>;
  let sttSession: ReturnType<typeof makeMockSttSession>;

  beforeEach(async () => {
    sttSession = makeMockSttSession();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioGateway,
        {
          provide: SpeechService,
          useValue: {
            getAdapter: jest.fn().mockReturnValue({
              startStream: jest.fn().mockResolvedValue(sttSession),
            }),
          },
        },
        {
          provide: AudioFactcheckService,
          useValue: {
            check: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    gateway = module.get<AudioGateway>(AudioGateway);
    speechService = module.get(SpeechService);
    factcheck = module.get(AudioFactcheckService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sttSession.subject$.complete();
  });

  // ─── Connection lifecycle ────────────────────────────────────────────────

  it('opens a Deepgram session on connection', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client);
    expect(speechService.getAdapter('deepgram').startStream).toHaveBeenCalledWith({
      language: 'ro-RO',
      sampleRate: 16000,
    });
  });

  it('sends an error and closes the socket when STT init fails', async () => {
    (speechService.getAdapter('deepgram').startStream as jest.Mock).mockRejectedValue(
      new Error('Deepgram unreachable'),
    );
    const client = makeMockWs();
    await gateway.handleConnection(client);

    expect(client.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"error"'),
    );
    expect(client.close).toHaveBeenCalled();
  });

  it('cleans up the session on disconnect', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client);
    await gateway.handleDisconnect(client);

    expect(sttSession.close).toHaveBeenCalled();
  });

  it('is a no-op disconnect for an unknown client', async () => {
    const unknown = makeMockWs();
    // Should not throw
    await expect(gateway.handleDisconnect(unknown)).resolves.toBeUndefined();
  });

  // ─── Message routing — interim ───────────────────────────────────────────

  it('sends an interim message for non-final transcripts', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client);

    sttSession.subject$.next({
      text: 'Salut',
      isFinal: false,
      confidence: 0.9,
      language: 'ro',
    });

    const sent = JSON.parse((client.send as jest.Mock).mock.calls[0][0] as string);
    expect(sent.type).toBe('interim');
    expect(sent.text).toBe('Salut');
    expect(sent).toHaveProperty('sessionId');
  });

  // ─── Message routing — final ─────────────────────────────────────────────

  it('sends a final message and triggers a fact-check on final transcripts', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client);

    sttSession.subject$.next({
      text: 'România are o populație de aproximativ nouăsprezece milioane de oameni',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    // Allow the fire-and-forget fact-check promise to settle
    await new Promise((r) => setImmediate(r));

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    expect(calls.some((m) => m.type === 'final')).toBe(true);
    expect(factcheck.check).toHaveBeenCalledWith(
      expect.stringContaining('România'),
      expect.any(String),
    );
  });

  it('sends a result message when the fact-check returns a verdict', async () => {
    const mockResult = {
      segmentId: 'some-seg',
      verdict: 'TRUE' as const,
      confidence: 0.9,
      explanation: 'Afirmație confirmată.',
      sources: ['https://insse.ro'],
      matchedFact: 'Populația României.',
    };
    factcheck.check.mockResolvedValue(mockResult);

    const client = makeMockWs();
    await gateway.handleConnection(client);

    sttSession.subject$.next({
      text: 'România are o populație de aproximativ nouăsprezece milioane de oameni',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    await new Promise((r) => setImmediate(r));

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    const resultMsg = calls.find((m) => m.type === 'result');
    expect(resultMsg).toBeDefined();
    expect(resultMsg?.verdict).toBe('TRUE');
    expect(resultMsg?.explanation).toBe('Afirmație confirmată.');
  });

  it('does not send a result message when the fact-check returns null', async () => {
    factcheck.check.mockResolvedValue(null);

    const client = makeMockWs();
    await gateway.handleConnection(client);

    sttSession.subject$.next({
      text: 'Unu doi trei',
      isFinal: true,
      confidence: 0.8,
      language: 'ro',
    });

    await new Promise((r) => setImmediate(r));

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    expect(calls.every((m) => m.type !== 'result')).toBe(true);
  });

  // ─── Audio forwarding ────────────────────────────────────────────────────

  it('forwards binary audio frames from the client to the Deepgram session', async () => {
    const client = makeMockWs() as unknown as EventEmitter;
    await gateway.handleConnection(client as unknown as WebSocket);

    const chunk = Buffer.from([0x01, 0x02, 0x03]);
    client.emit('message', chunk);

    expect(sttSession.sendAudio).toHaveBeenCalledWith(chunk);
  });

  // ─── STT stream error ────────────────────────────────────────────────────

  it('sends an error message to the client when the STT stream errors', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client);

    sttSession.subject$.error(new Error('Deepgram connection lost'));

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    const errorMsg = calls.find((m) => m.type === 'error');
    expect(errorMsg).toBeDefined();
    expect(errorMsg?.code).toBe('DEEPGRAM_ERROR');
  });
});
