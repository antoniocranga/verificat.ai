import { Module } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { DeepgramSttAdapter } from './adapters/deepgram-stt.adapter';
import { AzureSttAdapter } from './adapters/azure-stt.adapter';
import { WhisperSttAdapter } from './adapters/whisper-stt.adapter';

@Module({
  providers: [
    SpeechService,
    DeepgramSttAdapter,
    AzureSttAdapter,
    WhisperSttAdapter,
    {
      provide: 'STT_ADAPTERS',
      useFactory: (
        deepgram: DeepgramSttAdapter,
        azure: AzureSttAdapter,
        whisper: WhisperSttAdapter,
      ) => [deepgram, azure, whisper],
      inject: [DeepgramSttAdapter, AzureSttAdapter, WhisperSttAdapter],
    },
  ],
  exports: [SpeechService],
})
export class SpeechModule {}
