/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { WebSocket as NativeWebSocket } from 'ws';
import { SttAdapter, SttConfig } from '../interfaces/stt-adapter.interface';
import { SttSession, SttTranscriptEvent } from '../interfaces/stt-session.interface';

class DeepgramSession implements SttSession {
  private readonly logger = new Logger(DeepgramSession.name);
  private readonly transcript$ = new Subject<SttTranscriptEvent>();
  private readonly ws: NativeWebSocket;
  private readonly _connected: Promise<void>;
  private _resolveConnected!: () => void;
  private _rejectConnected!: (err: Error) => void;

  constructor(apiKey: string, config?: SttConfig) {
    const language = config?.language || 'ro-RO';
    const langParam = language.split('-')[0];
    const sampleRate = config?.sampleRate || 16000;

    this._connected = new Promise<void>((resolve, reject) => {
      this._resolveConnected = resolve;
      this._rejectConnected = reject;
    });

    const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langParam}&numerals=true&encoding=linear16&sample_rate=${sampleRate}&interim_results=true&endpointing=300`;

    this.ws = new NativeWebSocket(url, {
      headers: {
        Authorization: `Token ${apiKey}`
      }
    });

    this.ws.on('open', () => {
      this.logger.log('Deepgram WebSocket opened');
      this._resolveConnected();
    });

    this.ws.on('message', (data) => {
      try {
        const raw = typeof data === 'string' ? data : data.toString();
        const parsed = JSON.parse(raw);
        const transcript = parsed.channel?.alternatives?.[0]?.transcript;
        const confidence = parsed.channel?.alternatives?.[0]?.confidence || 0;
        const isFinal = parsed.is_final || false;

        if (transcript) {
          this.transcript$.next({
            text: transcript,
            isFinal,
            confidence,
            language,
          });
        }
      } catch (err) {
        this.logger.error('Failed to parse Deepgram response', err);
      }
    });

    this.ws.on('error', (err) => {
      this.logger.error('Deepgram WebSocket error', err);
      this._rejectConnected(err instanceof Error ? err : new Error(String(err)));
      this.transcript$.error(err);
    });

    this.ws.on('close', () => {
      this.transcript$.complete();
    });
  }

  waitForConnection(): Promise<void> {
    return this._connected;
  }

  sendAudio(chunk: Buffer): void {
    if (this.ws.readyState === NativeWebSocket.OPEN) {
      this.ws.send(chunk);
    } else {
      this.logger.warn('Deepgram WebSocket is not open. Cannot send audio chunk.');
    }
  }

  close(): Promise<void> {
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
      this.logger.warn('DEEPGRAM_API_KEY is not configured. Falling back to mock STT session.');
      return Promise.resolve(new MockDeepgramSession());
    }
    try {
      const session = new DeepgramSession(apiKey, config);
      return session.waitForConnection().then(() => session);
    } catch (err) {
      this.logger.error('Failed to start Deepgram stream, falling back to mock', err);
      return Promise.resolve(new MockDeepgramSession());
    }
  }

  async transcribeBuffer(
    buffer: Buffer,
    config?: SttConfig,
  ): Promise<{ text: string; confidence: number }> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      this.logger.warn('DEEPGRAM_API_KEY is not configured. Falling back to mock STT.');
      return {
        text: 'Mock transcription from Deepgram batch',
        confidence: 0.99,
      };
    }

    const language = config?.language || 'ro-RO';
    const langParam = language.split('-')[0];
    
    // We use model=nova-2 which provides high accuracy
    const url = `https://api.deepgram.com/v1/listen?model=nova-2&language=${langParam}&smart_format=true`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/webm', // Fallback, though Deepgram often auto-detects
        },
        body: buffer as any, // Node fetch might complain about Buffer types depending on definitions
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram API error (${response.status}): ${errText}`);
      }

      const data = await response.json() as any;
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
