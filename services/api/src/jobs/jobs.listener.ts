import {
  QueueEventsListener,
  QueueEventsHost,
  OnQueueEvent,
  InjectQueue,
} from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener('fact-verification')
export class JobsListener extends QueueEventsHost {
  private readonly logger = new Logger(JobsListener.name);

  constructor(
    @InjectQueue('fact-verification-dlq')
    private readonly dlqQueue: Queue,
    @InjectQueue('fact-verification')
    private readonly mainQueue: Queue,
  ) {
    super();
  }

  @OnQueueEvent('failed')
  async onFailed({
    jobId,
    failedReason,
  }: {
    jobId: string;
    failedReason: string;
  }) {
    const job = await this.mainQueue.getJob(jobId);
    if (!job) return;

    this.logger.warn(
      `Job ${jobId} failed on attempt ${job.attemptsMade}/${job.opts.attempts || 3}. Reason: ${failedReason}`,
    );

    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      this.logger.error(
        `Job ${jobId} exhausted all retries. Moving to dead-letter queue (DLQ).`,
      );
      await this.dlqQueue.add('dead-letter-job', {
        originalJobId: job.id,
        data: job.data as unknown,
        failedReason,
        failedAt: new Date().toISOString(),
      });
      await job.remove();
    }
  }
}
