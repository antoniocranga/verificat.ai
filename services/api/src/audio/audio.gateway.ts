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
import { ServerMessage } from './audio-protocol.types';
import { IncomingMessage } from 'http';

interface SessionHandle {
  sttSession: SttSession;
  transcriptSub: Subscription;
  sessionId: string;
  canonicalTranscript: string;
  transcriptVersion: number;
}

/**
 * WebSocket gateway for real-time audio streaming and fact-checking.
 *
 * Each connected client gets an isolated Deepgram STT session — sessions are
 * never shared (sharing would cause transcripts to bleed across users).
 *
 * Audio flow:
 *   Client (binary PCM) → Gateway → Deepgram (per-session WS)
 *   Deepgram events → Gateway → Client (JSON protocol messages)
 *   Final transcripts → AudioFactcheckService → Client (JSON result messages)
 *
 * NOTE: This gateway is currently unauthenticated at the WS handshake layer.
 * Until JWT handshake auth is implemented, deploy behind a network boundary
 * that restricts access to authenticated clients only (see open question in impl plan).
 */
@WebSocketGateway({ path: '/audio' })
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AudioGateway.name);
  private readonly sessions = new Map<WebSocket, SessionHandle>();

  // Optional: keep track of handles by sessionId to support reconnects across socket instances
  private readonly sessionHandlesById = new Map<string, SessionHandle>();

  constructor(
    private readonly speechService: SpeechService,
    private readonly factcheck: AudioFactcheckService,
  ) {}

  async handleConnection(client: WebSocket, request: IncomingMessage): Promise<void> {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    let sessionId = url.searchParams.get('sessionId') || '';

    // Reconnection logic
    if (sessionId && this.sessionHandlesById.has(sessionId)) {
      this.logger.log(`Client reconnected — session ${sessionId}`);
      const handle = this.sessionHandlesById.get(sessionId)!;
      
      // We don't replace the underlying WebSocket for the sttSession here directly since we'd need to re-bind the new client.
      // For simplicity in this Task B implementation, if a reconnect happens, we start a new STT session but preserve the canonical state.
      // Let's implement full state preservation:
      
      // Close the old socket if it's still somehow tracked (though handleDisconnect usually cleans it up)
      for (const [ws, h] of this.sessions.entries()) {
        if (h.sessionId === sessionId) {
          this.sessions.delete(ws);
          try { ws.close(); } catch (e) {}
        }
      }

      // Re-bind the new client to the old STT session output
      handle.transcriptSub.unsubscribe(); // Unsubscribe old
      
      handle.transcriptSub = this.subscribeToTranscript(client, handle);
      this.sessions.set(client, handle);
      
      // Emit immediate transcript_sync
      this.send(client, {
        type: 'transcript_sync',
        sessionId: handle.sessionId,
        transcriptVersion: handle.transcriptVersion,
        fullText: handle.canonicalTranscript,
      });

      this.bindClientAudio(client, handle.sttSession);
      return;
    }

    sessionId = sessionId || randomUUID();
    this.logger.log(`Client connected — new session ${sessionId}`);

    let sttSession: SttSession;
    try {
      sttSession = await this.speechService
        .getAdapter('deepgram')
        .startStream({ language: 'ro-RO', sampleRate: 16000 });
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
      transcriptSub: new Subscription(), // placeholder
      sessionId,
      canonicalTranscript: '',
      transcriptVersion: 0,
    };

    handle.transcriptSub = this.subscribeToTranscript(client, handle);
    this.sessions.set(client, handle);
    this.sessionHandlesById.set(sessionId, handle);

    this.bindClientAudio(client, sttSession);
  }

  private subscribeToTranscript(client: WebSocket, handle: SessionHandle): Subscription {
    return handle.sttSession.getTranscript$().subscribe({
      next: (event) => {
        if (!event.text) return;
        const text: string = event.text;

        if (event.isFinal) {
          const segmentId = randomUUID();
          this.send(client, { type: 'final', segmentId, text, sessionId: handle.sessionId });

          // 1. Calculate segment relative start offset in canonical transcript
          const segmentStartOffset = handle.canonicalTranscript.length === 0 
            ? 0 
            : handle.canonicalTranscript.length + 1; // +1 for the space we are about to add

          // 2. Append to canonical transcript
          if (handle.canonicalTranscript.length > 0) {
            handle.canonicalTranscript += ' ';
          }
          handle.canonicalTranscript += text;
          handle.transcriptVersion++;

          // 3. Emit transcript_sync
          const currentVersion = handle.transcriptVersion;
          this.send(client, {
            type: 'transcript_sync',
            sessionId: handle.sessionId,
            transcriptVersion: currentVersion,
            fullText: handle.canonicalTranscript,
          });

          // Non-blocking fact-check — fire and forget
          this.factcheck
            .check(text, segmentId)
            .then((result) => {
              if (result) {
                // Emit legacy result (optional, but prompt says "Do not change or remove existing message types")
                this.send(client, { type: 'result', ...result });

                // Emit new claim_result with translated offsets
                const translatedStart = segmentStartOffset + result.offset.start;
                const translatedEnd = segmentStartOffset + result.offset.end;

                this.send(client, {
                  type: 'claim_result',
                  sessionId: handle.sessionId,
                  claimId: result.claimId,
                  status: result.status,
                  confidence: result.confidence,
                  offset: {
                    start: translatedStart,
                    end: translatedEnd,
                  },
                  transcriptVersion: currentVersion,
                  reportId: result.reportId,
                });
              }
            })
            .catch((err: Error) => {
              this.logger.error(
                `Fact-check error for segment ${segmentId}: ${err.message}`,
              );
              this.send(client, {
                type: 'error',
                code: 'FACTCHECK_ERROR',
                message: err.message,
              });
            });
        } else {
          this.send(client, { type: 'interim', text, sessionId: handle.sessionId });
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
    // Forward all binary frames from this client to its Deepgram session
    client.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
      const chunk = Buffer.isBuffer(data)
        ? data
        : Buffer.from(data as ArrayBuffer);
      sttSession.sendAudio(chunk);
    });
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    const handle = this.sessions.get(client);
    if (!handle) return;

    const { sttSession, transcriptSub, sessionId } = handle;
    this.logger.log(`Client disconnected — session ${sessionId}`);

    transcriptSub.unsubscribe();
    await sttSession
      .close()
      .catch((err: Error) =>
        this.logger.warn(
          `Error closing STT session ${sessionId}: ${err.message}`,
        ),
      );
    this.sessions.delete(client);
    this.sessionHandlesById.delete(sessionId);
  }

  private send(client: WebSocket, data: ServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}
