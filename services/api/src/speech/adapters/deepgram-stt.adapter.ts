/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { SttAdapter, SttConfig } from '../interfaces/stt-adapter.interface';
import { SttSession, SttTranscriptEvent } from '../interfaces/stt-session.interface';

class DeepgramSession implements SttSession {
  private readonly logger = new Logger(DeepgramSession.name);
  private readonly transcript$ = new Subject<SttTranscriptEvent>();
  private readonly ws: WebSocket;

  constructor(apiKey: string, config?: SttConfig) {
    const language = config?.language || 'ro-RO';
    const langParam = language.split('-')[0];
    const sampleRate = config?.sampleRate || 16000;

    const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langParam}&numerals=true&encoding=linear16&sample_rate=${sampleRate}&api_key=${apiKey}`;
    
    const WSClass = (globalThis as any).WebSocket || (global as any).WebSocket;
    if (!WSClass) {
      throw new Error('Native WebSocket is not supported in this environment.');
    }

    this.ws = new WSClass(url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
        const isFinal = data.is_final || false;

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
    };

    this.ws.onerror = (err) => {
      this.logger.error('Deepgram WebSocket error', err);
      this.transcript$.error(err);
    };

    this.ws.onclose = () => {
      this.transcript$.complete();
    };
  }

  sendAudio(chunk: Buffer): void {
    if (this.ws.readyState === 1) { // OPEN
      this.ws.send(chunk);
    } else {
      this.logger.warn('Deepgram WebSocket is not open. Cannot send audio chunk.');
    }
  }

  close(): Promise<void> {
    if (this.ws.readyState === 1 || this.ws.readyState === 0) {
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
      return Promise.resolve(new DeepgramSession(apiKey, config));
    } catch (err) {
      this.logger.error('Failed to start Deepgram stream, falling back to mock', err);
      return Promise.resolve(new MockDeepgramSession());
    }
  }

  transcribeBuffer(
    _buffer: Buffer,
    _config?: SttConfig,
  ): Promise<{ text: string; confidence: number }> {
    return Promise.resolve({
      text: 'Mock transcription from Deepgram batch',
      confidence: 0.99,
    });
  }
}
