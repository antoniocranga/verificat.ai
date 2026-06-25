import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueEvents } from 'bullmq';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsConsumer } from './jobs.consumer';
import { JobsListener } from './jobs.listener';
import { JobsEventService } from './jobs-event.service';

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
  controllers: [JobsController],
  providers: [
    JobsService,
    JobsEventService,
    JobsConsumer,
    JobsListener,
    {
      provide: 'QUEUE_EVENTS',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        const events = new QueueEvents('fact-verification', {
          connection: { url: redisUrl },
        });
        events.on('error', (err) => {
          console.error('QueueEvents error:', err);
        });
        return events;
      },
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
