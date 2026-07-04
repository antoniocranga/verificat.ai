import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { Subscription } from 'rxjs';
import { SpeechService } from '../speech/speech.service';
import { SttSession } from '../speech/interfaces/stt-session.interface';
import { AudioFactcheckService } from './audio-factcheck.service';
import { SessionsService } from '../sessions/sessions.service';
import { MetricsService } from '../metrics/metrics.service';
import { ServerMessage } from './audio-protocol.types';
import { IncomingMessage } from 'http';

const DISCONNECT_GRACE_PERIOD_MS = 15000;
const BACKGROUND_GRACE_PERIOD_MS = 60000;
const STT_CONFIDENCE_THRESHOLD = 0.5;

interface PersistedClaimEntry {
  verdict: string;
}

interface SessionHandle {
  sttSession: SttSession;
  transcriptSub: Subscription;
  sessionId: string;
  canonicalTranscript: string;
  transcriptVersion: number;
  utteranceBuffer: string;
  utteranceStartOffset: number;
  persistedClaims: PersistedClaimEntry[];
  paused?: boolean;
}

@WebSocketGateway({ path: '/audio' })
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AudioGateway.name);
  private readonly sessions = new Map<WebSocket, SessionHandle>();
  private readonly sessionHandlesById = new Map<string, SessionHandle>();
  private readonly pendingTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly speechService: SpeechService,
    private readonly factcheck: AudioFactcheckService,
    private readonly sessionsService: SessionsService,
    private readonly metrics: MetricsService,
  ) {}

  async handleConnection(
    client: WebSocket,
    request: IncomingMessage,
  ): Promise<void> {
    const url = new URL(
      request.url || '',
      `http://${request.headers.host || 'localhost'}`,
    );
    let sessionId = url.searchParams.get('sessionId') || '';

    if (sessionId && this.sessionHandlesById.has(sessionId)) {
      this.logger.log(`Client reconnected — session ${sessionId}`);
      const handle = this.sessionHandlesById.get(sessionId)!;

      if (this.pendingTimeouts.has(sessionId)) {
        clearTimeout(this.pendingTimeouts.get(sessionId));
        this.pendingTimeouts.delete(sessionId);
      }
      handle.paused = false;

      for (const [ws, h] of this.sessions.entries()) {
        if (h.sessionId === sessionId) {
          this.sessions.delete(ws);
          try {
            ws.close();
          } catch {
            /* ignore */
          }
        }
      }

      handle.transcriptSub.unsubscribe();
      handle.transcriptSub = this.subscribeToTranscript(client, handle);
      this.sessions.set(client, handle);

      this.send(client, {
        type: 'transcript_sync',
        sessionId: handle.sessionId,
        transcriptVersion: handle.transcriptVersion,
        fullText: handle.canonicalTranscript,
      });

      this.bindClientAudio(client, handle.sttSession);
      return;
    }

    // New session — create session row in Supabase
    try {
      const created = await this.sessionsService.createSession({
        mode: 'realtime',
      });
      sessionId = created.id;
    } catch (err) {
      this.logger.error('Failed to create session', String(err));
      this.send(client, {
        type: 'error',
        code: 'SESSION_CREATE_ERROR',
        message: 'Failed to initialize session',
      });
      client.close();
      return;
    }

    this.metrics.activeWsConnections.inc();
    this.logger.log(`Client connected — new session ${sessionId}`);

    let sttSession: SttSession;
    try {
      const staticKeyterms = ['Brașov', 'Paul', 'Klaus Iohannis', 'București'];
      this.logger.log(
        `Initializing STT stream with keyterms: ${staticKeyterms.join(', ')}`,
      );
      sttSession = await this.speechService.getAdapter('deepgram').startStream({
        sessionId,
        language: 'ro-RO',
        sampleRate: 16000,
        keyterms: staticKeyterms,
      });

      if (sttSession.isMock) {
        this.send(client, {
          type: 'warning',
          code: 'MOCK_SESSION_ACTIVE',
          message: 'Using mock STT session for local development',
        });
      }
    } catch (err) {
      this.send(client, {
        type: 'error',
        code: 'STT_INIT_ERROR',
        message: String(err),
      });
      client.close();
      return;
    }

    const handle: SessionHandle = {
      sttSession,
      transcriptSub: new Subscription(),
      sessionId,
      canonicalTranscript: '',
      transcriptVersion: 0,
      utteranceBuffer: '',
      utteranceStartOffset: 0,
      persistedClaims: [],
    };

    handle.transcriptSub = this.subscribeToTranscript(client, handle);
    this.sessions.set(client, handle);
    this.sessionHandlesById.set(sessionId, handle);

    this.bindClientAudio(client, sttSession);
  }

  private subscribeToTranscript(
    client: WebSocket,
    handle: SessionHandle,
  ): Subscription {
    return handle.sttSession.getTranscript$().subscribe({
      next: (event) => {
        if (!event.text) return;
        const text: string = event.text;

        if (event.isFinal) {
          const segmentId = randomUUID();
          this.send(client, {
            type: 'final',
            segmentId,
            text,
            sessionId: handle.sessionId,
          });

          const segmentStartOffset =
            handle.canonicalTranscript.length === 0
              ? 0
              : handle.canonicalTranscript.length + 1;

          if (handle.canonicalTranscript.length > 0) {
            handle.canonicalTranscript += ' ';
          }
          handle.canonicalTranscript += text;
          handle.transcriptVersion++;

          const currentVersion = handle.transcriptVersion;
          this.send(client, {
            type: 'transcript_sync',
            sessionId: handle.sessionId,
            transcriptVersion: currentVersion,
            fullText: handle.canonicalTranscript,
          });

          if (!handle.utteranceBuffer) {
            handle.utteranceBuffer = text;
            handle.utteranceStartOffset = segmentStartOffset;
          } else {
            handle.utteranceBuffer += ' ' + text;
          }

          const isUtteranceEnd = /[.!?]$/.test(text.trim());
          const hasCapitalized = /[A-ZĂÂÎȘȚ]/.test(text);
          const triggered =
            isUtteranceEnd ||
            hasCapitalized ||
            handle.utteranceBuffer.length > 200;
          const confidence = event.confidence ?? 1.0;

          this.metrics.sttSegmentsFinalizedTotal.inc();

          this.logger.log('Segment finalized', {
            sessionId: handle.sessionId,
            segmentId,
            textLength: text.length,
            decision: triggered ? 'triggered' : 'buffered',
            confidence,
          });

          if (triggered) {
            if (confidence < STT_CONFIDENCE_THRESHOLD) {
              this.logger.warn(
                'Skipping fact-check due to low STT confidence',
                { sessionId: handle.sessionId, segmentId, confidence },
              );
              this.metrics.sttLowConfidenceSegmentsTotal.inc();
              handle.utteranceBuffer = '';
              return;
            }

            const utterance = handle.utteranceBuffer;
            const checkStartOffset = handle.utteranceStartOffset;
            const checkSegmentId = segmentId;

            this.factcheck
              .check(utterance, checkSegmentId, handle.sessionId)
              .then((result) => {
                if (!result) return;
                if ('error' in result) {
                  this.send(client, {
                    type: 'claim_error',
                    sessionId: handle.sessionId,
                    segmentId: checkSegmentId,
                    code: result.code,
                    message: result.message,
                  });
                  return;
                }

                handle.persistedClaims.push({
                  verdict: result.status,
                });

                this.send(client, { type: 'result', ...result });

                const relStart = result.offset?.start ?? 0;
                const relEnd = result.offset?.end ?? utterance.length;
                const canonicalStart = checkStartOffset + relStart;
                const canonicalEnd = checkStartOffset + relEnd;

                this.logger.log('Computed canonical offset', {
                  sessionId: handle.sessionId,
                  claimId: result.claimId,
                  utteranceStartOffset: checkStartOffset,
                  utteranceLength: utterance.length,
                  canonicalStart,
                  canonicalEnd,
                });

                this.send(client, {
                  type: 'claim_result',
                  sessionId: handle.sessionId,
                  claimId: result.claimId,
                  status: result.status,
                  confidence: result.confidence,
                  offset: {
                    start: canonicalStart,
                    end: canonicalEnd,
                  },
                  transcriptVersion: currentVersion,
                  reportId: result.reportId,
                });
              })
              .catch((err: Error) => {
                this.logger.error(
                  `Fact-check error for segment ${checkSegmentId}: ${err.message}`,
                );
                this.send(client, {
                  type: 'error',
                  code: 'FACTCHECK_ERROR',
                  message: err.message,
                });
              });

            handle.utteranceBuffer = '';
          }
        } else {
          this.send(client, {
            type: 'interim',
            text,
            sessionId: handle.sessionId,
          });
        }
      },
      error: (err: Error) => {
        this.logger.error(
          `STT stream error — session ${handle.sessionId}: ${err.message}`,
        );
        this.send(client, {
          type: 'error',
          code: 'DEEPGRAM_ERROR',
          message: err.message,
        });
      },
    });
  }

  private bindClientAudio(client: WebSocket, sttSession: SttSession) {
    client.on(
      'message',
      (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
        if (!isBinary) {
          try {
            const str = Buffer.isBuffer(data)
              ? data.toString()
              : Buffer.from(data as ArrayBuffer).toString();
            const msg = JSON.parse(str) as { type?: string };
            if (msg.type === 'client_pause') {
              const handle = this.sessions.get(client);
              if (handle) handle.paused = true;
            } else if (msg.type === 'client_resume') {
              const handle = this.sessions.get(client);
              if (handle) handle.paused = false;
            }
          } catch {
            /* non-JSON message ignored */
          }
          return;
        }
        const chunk = Buffer.isBuffer(data)
          ? data
          : Buffer.from(data as ArrayBuffer);
        sttSession.sendAudio(chunk);
      },
    );
  }

  handleDisconnect(client: WebSocket): void {
    const handle = this.sessions.get(client);
    if (!handle) return;

    this.metrics.activeWsConnections.dec();
    this.sessions.delete(client);

    const { sttSession, transcriptSub, sessionId, persistedClaims, paused } =
      handle;
    this.logger.log(
      `Client disconnected — session ${sessionId}. Paused: ${paused}`,
    );

    const timeout = paused
      ? BACKGROUND_GRACE_PERIOD_MS
      : DISCONNECT_GRACE_PERIOD_MS;

    const timer = setTimeout(() => {
      this.logger.log(
        `Grace period expired for session ${sessionId}, finalizing.`,
      );
      this.pendingTimeouts.delete(sessionId);
      this.sessionHandlesById.delete(sessionId);
      transcriptSub.unsubscribe();

      this.sessionsService
        .updateSessionOnDisconnect(sessionId, persistedClaims)

        .catch((err: Error) =>
          this.logger.warn(
            `Failed to finalize session ${sessionId}: ${err.message}`,
          ),
        );

      sttSession
        .close()
        .catch((err: Error) =>
          this.logger.warn(
            `Error closing STT session ${sessionId}: ${err.message}`,
          ),
        );
    }, timeout);

    this.pendingTimeouts.set(sessionId, timer);
  }

  private send(client: WebSocket, message: ServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));

      if (message.type === 'claim_result') {
        this.metrics.claimResultSentTotal.inc();
        this.logger.log('Dispatched claim_result', {
          sessionId: message.sessionId,
          claimId: message.claimId,
          messageType: message.type,
        });
      } else if (message.type === 'claim_error') {
        this.logger.log('Dispatched claim_error', {
          sessionId: message.sessionId,
          segmentId: message.segmentId,
          messageType: message.type,
        });
      }
    }
  }
}
