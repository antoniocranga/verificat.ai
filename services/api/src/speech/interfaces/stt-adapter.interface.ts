import { SttSession } from './stt-session.interface';

export interface SttConfig {
  language?: string; // Default 'ro-RO'
  sampleRate?: number; // Default 16000
}

export interface SttAdapter {
  readonly engineName: 'deepgram' | 'azure' | 'whisper';

  /**
   * Start a real-time streaming transcription session.
   */
  startStream(config?: SttConfig): Promise<SttSession>;

  /**
   * Perform batch transcription of a complete audio file buffer.
   */
  transcribeBuffer(
    buffer: Buffer,
    config?: SttConfig,
  ): Promise<{ text: string; confidence: number }>;
}
