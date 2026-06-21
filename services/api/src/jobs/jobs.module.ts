import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsConsumer } from './jobs.consumer';
import { JobsListener } from './jobs.listener';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'fact-verification' },
      { name: 'fact-verification-dlq' },
    ),
  ],
  providers: [JobsService, JobsConsumer, JobsListener],
  exports: [JobsService],
})
export class JobsModule {}
