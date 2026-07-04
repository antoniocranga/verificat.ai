import { Module } from '@nestjs/common';
import { AudioGateway } from './audio.gateway';
import { AudioFactcheckService } from './audio-factcheck.service';
import { SpeechModule } from '../speech/speech.module';
import { FactChecksModule } from '../fact-checks/fact-checks.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SpeechModule, FactChecksModule, SessionsModule],
  providers: [AudioGateway, AudioFactcheckService],
})
export class AudioModule {}
