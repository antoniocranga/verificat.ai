/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { WebSocket as NativeWebSocket } from 'ws';
import { SttAdapter, SttConfig } from '../interfaces/stt-adapter.interface';
import { SttSession, SttTranscriptEvent } from '../interfaces/stt-session.interface';

class DeepgramSession implements SttSession {
  private readonly logger = new Logger(DeepgramSession.name);
  private readonly transcript$ = new Subject<SttTranscriptEvent>();
  private ws!: NativeWebSocket;
  private readonly _connected: Promise<void>;
  private _resolveConnected!: () => void;
  private _rejectConnected!: (err: Error) => void;
  private hasConnectedBefore = false;
  private manualClose = false;

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly url: string;
  private readonly apiKey: string;
  private readonly language: string;
  private keepAliveInterval?: NodeJS.Timeout;
  private lastAudioSentAt: number = Date.now();

  constructor(apiKey: string, config?: SttConfig) {
    this.apiKey = apiKey;
    this.language = config?.language || 'ro-RO';
    const langParam = this.language.split('-')[0];
    const sampleRate = config?.sampleRate || 16000;

    this._connected = new Promise<void>((resolve, reject) => {
      this._resolveConnected = resolve;
      this._rejectConnected = reject;
    });

    let url = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${langParam}&numerals=true&encoding=linear16&sample_rate=${sampleRate}&interim_results=true&endpointing=300`;
    
    if (config?.keyterms && config.keyterms.length > 0) {
      for (const term of config.keyterms) {
        url += `&keyterm=${encodeURIComponent(term)}`;
      }
    }
    
    this.url = url;

    this.connect();
  }

  private connect() {
    this.ws = new NativeWebSocket(this.url, {
      headers: {
        Authorization: `Token ${this.apiKey}`
      }
    });

    this.ws.on('open', () => {
      this.logger.log(this.hasConnectedBefore ? 'Deepgram WebSocket reconnected' : 'Deepgram WebSocket opened');
      this.reconnectAttempts = 0;
      this.startKeepAlive();
      if (!this.hasConnectedBefore) {
        this.hasConnectedBefore = true;
        this._resolveConnected();
      }
    });

    this.ws.on('message', (data) => {
      try {
        const raw = typeof data === 'string' ? data : data.toString();
        const parsed = JSON.parse(raw);

        // Capture request ID for debuggability
        if (parsed.type === 'Metadata' && parsed.request_id) {
          this.logger.debug(`Deepgram stream request ID: ${parsed.request_id}`);
        } else if (parsed.metadata?.request_id) {
          this.logger.debug(`Deepgram stream request ID: ${parsed.metadata.request_id}`);
        }

        const transcript = parsed.channel?.alternatives?.[0]?.transcript;
        const confidence = parsed.channel?.alternatives?.[0]?.confidence || 0;
        const isFinal = parsed.is_final || false;

        if (transcript) {
          this.transcript$.next({
            text: transcript,
            isFinal,
            confidence,
            language: this.language,
          });
        }
      } catch (err) {
        this.logger.error('Failed to parse Deepgram response', err);
      }
    });

    this.ws.on('error', (err) => {
      this.logger.error('Deepgram WebSocket error', err);
      this.handleDisconnect(err instanceof Error ? err : new Error(String(err)));
    });

    this.ws.on('close', () => {
      this.handleDisconnect(new Error('WebSocket closed unexpectedly'));
    });
  }

  private cleanupOldWs() {
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === NativeWebSocket.OPEN || this.ws.readyState === NativeWebSocket.CONNECTING) {
        this.ws.close();
      }
    }
  }

  private handleDisconnect(err?: Error) {
    this.cleanupOldWs();
    this.stopKeepAlive();
    
    if (this.manualClose) {
      this.transcript$.complete();
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Exhausted Deepgram reconnect attempts');
      const finalErr = err || new Error('WebSocket closed unexpectedly');
      if (!this.hasConnectedBefore) {
        this._rejectConnected(finalErr);
      }
      this.transcript$.error(finalErr);
      return;
    }

    this.reconnectAttempts++;
    // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, 8000ms
    const delay = Math.min(500 * Math.pow(2, this.reconnectAttempts - 1), 8000);
    this.logger.warn(`Deepgram connection lost. Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      // Send KeepAlive if no audio was sent in the last 5 seconds
      if (Date.now() - this.lastAudioSentAt > 5000) {
        if (this.ws.readyState === NativeWebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
        }
      }
    }, 5000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = undefined;
    }
  }

  waitForConnection(): Promise<void> {
    return this._connected;
  }

  sendAudio(chunk: Buffer): void {
    if (this.ws.readyState === NativeWebSocket.OPEN) {
      this.ws.send(chunk);
      this.lastAudioSentAt = Date.now();
    } else {
      this.logger.warn('Deepgram WebSocket is not open. Cannot send audio chunk.');
    }
  }

  close(): Promise<void> {
    this.manualClose = true;
    this.stopKeepAlive();
    if (this.ws.readyState === NativeWebSocket.OPEN || this.ws.readyState === NativeWebSocket.CONNECTING) {
      this.ws.close();
    }
    return Promise.resolve();
  }

  getTranscript$(): Observable<SttTranscriptEvent> {
    return this.transcript$.asObservable();
  }
}

class MockDeepgramSession implements SttSession {
  private readonly transcript$ = new Subject<SttTranscriptEvent>();

  sendAudio(_chunk: Buffer): void {
    this.transcript$.next({
      text: 'Mock transcription from Deepgram stream (no API key)',
      isFinal: true,
      confidence: 0.99,
      language: 'ro-RO',
    });
  }

  close(): Promise<void> {
    this.transcript$.complete();
    return Promise.resolve();
  }

  getTranscript$(): Observable<SttTranscriptEvent> {
    return this.transcript$.asObservable();
  }
}

@Injectable()
export class DeepgramSttAdapter implements SttAdapter {
  private readonly logger = new Logger(DeepgramSttAdapter.name);
  readonly engineName = 'deepgram';

  startStream(config?: SttConfig): Promise<SttSession> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('DEEPGRAM_API_KEY is not configured. Falling back to mock STT session.');
        return Promise.resolve(new MockDeepgramSession());
      } else {
        throw new Error('DEEPGRAM_API_KEY is missing in production environment');
      }
    }
    try {
      const session = new DeepgramSession(apiKey, config);
      return session.waitForConnection().then(() => session);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error('Failed to start Deepgram stream, falling back to mock', err);
        return Promise.resolve(new MockDeepgramSession());
      } else {
        throw err;
      }
    }
  }

  async transcribeBuffer(
    buffer: Buffer,
    config?: SttConfig,
  ): Promise<{ text: string; confidence: number }> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('DEEPGRAM_API_KEY is not configured. Falling back to mock STT.');
        return {
          text: 'Mock transcription from Deepgram batch',
          confidence: 0.99,
        };
      } else {
        throw new Error('DEEPGRAM_API_KEY is missing in production environment');
      }
    }

    const language = config?.language || 'ro-RO';
    const langParam = language.split('-')[0];
    
    if (!config?.contentType) {
      this.logger.warn('transcribeBuffer called without an explicit contentType. Defaulting to audio/webm, which may degrade transcription quality if audio format is different.');
    }
    const contentType = config?.contentType || 'audio/webm';
    
    let url = `https://api.deepgram.com/v1/listen?model=nova-3&language=${langParam}&smart_format=true`;

    if (config?.keyterms && config.keyterms.length > 0) {
      for (const term of config.keyterms) {
        url += `&keyterm=${encodeURIComponent(term)}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': contentType,
        },
        body: buffer as any, // Node fetch might complain about Buffer types depending on definitions
      });

      const dgRequestId = response.headers.get('dg-request-id');
      if (dgRequestId) {
        this.logger.debug(`Deepgram batch request ID: ${dgRequestId}`);
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram API error (${response.status}): ${errText}`);
      }

      const data = await response.json() as any;
      
      if (data.metadata?.request_id && !dgRequestId) {
        this.logger.debug(`Deepgram batch request ID: ${data.metadata.request_id}`);
      }

      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

      return {
        text: transcript,
        confidence,
      };
    } catch (err) {
      this.logger.error('Failed to transcribe buffer via Deepgram', err);
      throw err;
    }
  }
}

