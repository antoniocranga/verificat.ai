/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter } from 'events';
import { AudioGateway } from './audio.gateway';
import { SpeechService } from '../speech/speech.service';
import { AudioFactcheckService } from './audio-factcheck.service';
import { SessionsService } from '../sessions/sessions.service';
import { MetricsService } from '../metrics/metrics.service';
import { WebSocket } from 'ws';
import { Subject } from 'rxjs';
import { IncomingMessage } from 'http';

function makeMockWs(readyState = WebSocket.OPEN): jest.Mocked<WebSocket> {
  const ee = new EventEmitter();
  return Object.assign(ee, {
    readyState,
    send: jest.fn(),
    close: jest.fn(),
    on: ee.on.bind(ee),
  }) as unknown as jest.Mocked<WebSocket>;
}

function makeMockRequest(url = '/audio'): IncomingMessage {
  return {
    url,
    headers: { host: 'localhost' }
  } as unknown as IncomingMessage;
}

function mockMetric() {
  return { inc: jest.fn(), add: jest.fn(), observe: jest.fn(), set: jest.fn(), labels: jest.fn().mockReturnThis() };
}

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
        {
          provide: SessionsService,
          useValue: {
            createSession: jest.fn().mockResolvedValue({ id: 'mock-session-id' }),
            updateSessionOnDisconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            activeWsConnections: { inc: jest.fn(), dec: jest.fn() },
            sttSessionsTotal: { inc: jest.fn() },
            sttMockSessionsTotal: { inc: jest.fn() },
            sttLowConfidenceSegmentsTotal: { inc: jest.fn() },
            sttSessionDurationSeconds: { observe: jest.fn() },
            sttSegmentsFinalizedTotal: { inc: jest.fn() },
            sttSegmentsDroppedTotal: { inc: jest.fn() },
            factcheckRequestsTotal: { inc: jest.fn() },
            factcheckRequestDurationSeconds: { observe: jest.fn() },
            factcheckVerdictsTotal: { inc: jest.fn() },
            claimResultSentTotal: { inc: jest.fn() },
            sessionsPersistedTotal: { inc: jest.fn() },
            httpRequestsTotal: { inc: jest.fn() },
            httpRequestDurationSeconds: { observe: jest.fn() },
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
    await gateway.handleConnection(client, makeMockRequest());
    expect(speechService.getAdapter('deepgram').startStream).toHaveBeenCalledWith({
      language: 'ro-RO',
      sampleRate: 16000,
      sessionId: 'mock-session-id',
      keyterms: expect.any(Array),
    });
  });

  it('sends an error and closes the socket when STT init fails', async () => {
    (speechService.getAdapter('deepgram').startStream as jest.Mock).mockRejectedValue(
      new Error('Deepgram unreachable'),
    );
    const client = makeMockWs();
    await gateway.handleConnection(client, makeMockRequest());

    expect(client.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"error"'),
    );
    expect(client.close).toHaveBeenCalled();
  });

  it('cleans up the session on disconnect', async () => {
    jest.useFakeTimers();
    try {
      const client = makeMockWs();
      await gateway.handleConnection(client, makeMockRequest());
      
      const p = gateway.handleDisconnect(client);
      jest.advanceTimersByTime(20000);
      await p;
      await Promise.resolve(); // drain microtasks

      expect(sttSession.close).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  // ─── Transcript & Offset Logic ─────────────────────────────────────────────

  it('maintains a canonical transcript and emits transcript_sync', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client, makeMockRequest());

    sttSession.subject$.next({
      text: 'Prima parte',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    const sync1 = calls.find((m) => m.type === 'transcript_sync');
    expect(sync1.fullText).toBe('Prima parte');
    expect(sync1.transcriptVersion).toBe(1);

    (client.send as jest.Mock).mockClear();

    sttSession.subject$.next({
      text: 'a doua parte',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    const calls2 = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    const sync2 = calls2.find((m) => m.type === 'transcript_sync');
    expect(sync2.fullText).toBe('Prima parte a doua parte');
    expect(sync2.transcriptVersion).toBe(2);
  });

  it('translates fact-check offsets to canonical offsets', async () => {
    const client = makeMockWs();
    await gateway.handleConnection(client, makeMockRequest());

    // Send first segment
    sttSession.subject$.next({
      text: 'Prima parte',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    // Mock fact-check result for second segment
    const mockResult = {
      segmentId: 'some-seg',
      verdict: 'TRUE' as const,
      status: 'true' as const,
      confidence: 0.9,
      explanation: 'Afirmație confirmată.',
      sources: ['https://insse.ro'],
      matchedFact: 'Populația României.',
      claimId: 'claim-123',
      reportId: 'report-123',
      offset: { start: 2, end: 6 }, // relative to "a doua parte"
    };
    factcheck.check.mockResolvedValueOnce(mockResult as any);

    // Send second segment
    sttSession.subject$.next({
      text: 'a doua parte.',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    await new Promise((r) => setImmediate(r));

    const calls = (client.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );

    const claimResult = calls.find((m) => m.type === 'claim_result');
    expect(claimResult).toBeDefined();
    
    // "Prima parte" length = 11. Plus space = 12. 
    // canonical start = 12 + 2 = 14. canonical end = 12 + 6 = 18.
    expect(claimResult.offset.start).toBe(14);
    expect(claimResult.offset.end).toBe(18);
    expect(claimResult.transcriptVersion).toBe(2);
  });

  it('reconnects and emits transcript_sync immediately', async () => {
    const client1 = makeMockWs();
    await gateway.handleConnection(client1, makeMockRequest('/audio'));

    sttSession.subject$.next({
      text: 'Test',
      isFinal: true,
      confidence: 0.95,
      language: 'ro',
    });

    const client2 = makeMockWs();
    await gateway.handleConnection(client2, makeMockRequest('/audio?sessionId=mock-session-id'));

    const calls = (client2.send as jest.Mock).mock.calls.map((c) =>
      JSON.parse(c[0] as string),
    );
    const syncMsg = calls.find((m) => m.type === 'transcript_sync');
    expect(syncMsg).toBeDefined();
    expect(syncMsg.fullText).toBe('Test');
    expect(syncMsg.transcriptVersion).toBe(1);
    expect(syncMsg.sessionId).toBe('mock-session-id');
  });
});
