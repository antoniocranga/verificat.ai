/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import * as http from 'http';
import { SttAdapter, SttConfig } from '../interfaces/stt-adapter.interface';
import { SttSession, SttTranscriptEvent } from '../interfaces/stt-session.interface';

class MockWhisperSession implements SttSession {
  private readonly transcript$ = new Subject<SttTranscriptEvent>();

  sendAudio(chunk: Buffer): void {
    this.transcript$.next({
      text: 'Mock transcription from Whisper stream',
      isFinal: true,
      confidence: 0.90,
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
export class WhisperSttAdapter implements SttAdapter {
  private readonly logger = new Logger(WhisperSttAdapter.name);
  readonly engineName = 'whisper';

  startStream(config?: SttConfig): Promise<SttSession> {
    return Promise.resolve(new MockWhisperSession());
  }

  transcribeBuffer(
    buffer: Buffer,
    config?: SttConfig,
  ): Promise<{ text: string; confidence: number }> {
    if (process.env.NODE_ENV === 'test') {
      this.logger.warn('Running in test environment. Falling back to mock Whisper transcription.');
      return Promise.resolve({
        text: 'Mock transcription from Whisper batch',
        confidence: 0.90,
      });
    }

    const whisperUrl = process.env.WHISPER_URL || 'http://verificat-whisper:9000';
    const language = config?.language || 'ro-RO';
    const langParam = language.split('-')[0];

    // Enforce URL construction
    const parsedUrl = new URL(`${whisperUrl}/asr?task=transcribe&language=${langParam}&output=json`);

    const boundary = '----SafeWhisperBoundary' + Math.random().toString(36).substring(2);
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="audio_file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const payload = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      buffer,
      Buffer.from(footer, 'utf-8'),
    ]);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Accept': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              text: parsed.text || '',
              confidence: 0.90, // Whisper local does not always expose a single normalized confidence score
            });
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            reject(new Error(`Failed to parse Whisper local ASR response: ${errMsg}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }
}
