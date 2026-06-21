import { Injectable, Inject } from '@nestjs/common';
import { SttAdapter } from './interfaces/stt-adapter.interface';

@Injectable()
export class SpeechService {
  constructor(
    @Inject('STT_ADAPTERS') private readonly adapters: SttAdapter[],
  ) {}

  /**
   * Resolves the appropriate adapter based on engine selection.
   */
  getAdapter(preferredEngine?: 'deepgram' | 'azure' | 'whisper'): SttAdapter {
    const engine = preferredEngine || 'deepgram';
    const adapter = this.adapters.find((a) => a.engineName === engine);
    if (!adapter) {
      throw new Error(`STT Engine "${engine}" not found/configured.`);
    }
    return adapter;
  }
}
