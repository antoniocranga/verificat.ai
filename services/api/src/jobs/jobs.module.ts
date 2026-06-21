import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsConsumer } from './jobs.consumer';
import { JobsListener } from './jobs.listener';

import { SpeechModule } from '../speech/speech.module';
import { FactChecksModule } from '../fact-checks/fact-checks.module';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'fact-verification' },
      { name: 'fact-verification-dlq' },
    ),
    SpeechModule,
    FactChecksModule,
    SourcesModule,
  ],
  providers: [JobsService, JobsConsumer, JobsListener],
  exports: [JobsService],
})
export class JobsModule {}
