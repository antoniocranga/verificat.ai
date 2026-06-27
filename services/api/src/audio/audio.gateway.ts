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

interface SessionHandle {
  sttSession: SttSession;
  transcriptSub: Subscription;
  sessionId: string;
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
@WebSocketGateway({ path: '/audio', transports: ['websocket'] })
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AudioGateway.name);
  private readonly sessions = new Map<WebSocket, SessionHandle>();

  constructor(
    private readonly speechService: SpeechService,
    private readonly factcheck: AudioFactcheckService,
  ) {}

  async handleConnection(client: WebSocket): Promise<void> {
    const sessionId = randomUUID();
    this.logger.log(`Client connected — session ${sessionId}`);

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

    const transcriptSub = sttSession.getTranscript$().subscribe({
      next: (event) => {
        if (!event.text) return;
        const text: string = event.text;

        if (event.isFinal) {
          const segmentId = randomUUID();
          this.send(client, { type: 'final', segmentId, text, sessionId });

          // Non-blocking fact-check — fire and forget
          this.factcheck
            .check(text, segmentId)
            .then((result) => {
              if (result) {
                this.send(client, { type: 'result', ...result });
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
          this.send(client, { type: 'interim', text, sessionId });
        }
      },
      error: (err: Error) => {
        this.logger.error(
          `STT stream error — session ${sessionId}: ${err.message}`,
        );
        this.send(client, {
          type: 'error',
          code: 'DEEPGRAM_ERROR',
          message: err.message,
        });
      },
    });

    this.sessions.set(client, { sttSession, transcriptSub, sessionId });

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
  }

  private send(client: WebSocket, data: ServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}
