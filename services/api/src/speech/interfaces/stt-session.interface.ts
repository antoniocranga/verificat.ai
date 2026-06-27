import { Observable } from 'rxjs';

export interface SttTranscriptEvent {
  text: string;
  isFinal: boolean;
  confidence: number;
  language: string;
}

export interface SttSession {
  /**
   * Send a chunk of raw audio buffer (PCM/linear16/etc.) to the active session.
   */
  sendAudio(chunk: Buffer): void;

  /**
   * Close the transcription session gracefully.
   */
  close(): Promise<void>;

  /**
   * Stream of transcription events emitted by the engine.
   */
  getTranscript$(): Observable<SttTranscriptEvent>;
}
