import { Module } from '@nestjs/common';
import { AudioGateway } from './audio.gateway';
import { AudioFactcheckService } from './audio-factcheck.service';
import { SpeechModule } from '../speech/speech.module';
import { FactChecksModule } from '../fact-checks/fact-checks.module';

@Module({
  imports: [
    // SpeechModule provides SpeechService (Deepgram adapter)
    SpeechModule,
    // FactChecksModule exports EvidenceRetrievalService + VerdictGenerationService
    FactChecksModule,
  ],
  providers: [AudioGateway, AudioFactcheckService],
})
export class AudioModule {}
