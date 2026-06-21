/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import * as https from 'https';
import { SttAdapter, SttConfig } from '../interfaces/stt-adapter.interface';
import { SttSession, SttTranscriptEvent } from '../interfaces/stt-session.interface';

class MockAzureSession implements SttSession {
  private readonly transcript$ = new Subject<SttTranscriptEvent>();

  sendAudio(chunk: Buffer): void {
    this.transcript$.next({
      text: 'Mock transcription from Azure stream',
      isFinal: true,
      confidence: 0.95,
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
export class AzureSttAdapter implements SttAdapter {
  private readonly logger = new Logger(AzureSttAdapter.name);
  readonly engineName = 'azure';

  startStream(config?: SttConfig): Promise<SttSession> {
    return Promise.resolve(new MockAzureSession());
  }

  transcribeBuffer(
    buffer: Buffer,
    config?: SttConfig,
  ): Promise<{ text: string; confidence: number }> {
    const apiKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'westeurope';
    const language = config?.language || 'ro-RO';

    if (!apiKey) {
      this.logger.warn('AZURE_SPEECH_KEY is not configured. Falling back to mock batch transcription.');
      return Promise.resolve({
        text: 'Mock transcription from Azure batch (no API key)',
        confidence: 0.95,
      });
    }

    const path = `/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;
    const options = {
      hostname: `${region}.stt.speech.microsoft.com`,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Accept': 'application/json',
        'Content-Length': buffer.length,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.RecognitionStatus === 'Success') {
              const bestResult = parsed.NBest?.[0] || parsed;
              resolve({
                text: bestResult.Display || bestResult.DisplayText || '',
                confidence: bestResult.Confidence || 0.95,
              });
            } else {
              this.logger.warn(`Azure Speech API status: ${parsed.RecognitionStatus}`);
              resolve({
                text: '',
                confidence: 0,
              });
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            reject(new Error(`Failed to parse Azure Speech API response: ${errMsg}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(buffer);
      req.end();
    });
  }
}
