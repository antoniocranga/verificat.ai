import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { Observable, Subject, finalize } from 'rxjs';

interface SseMessageEvent {
  data: string;
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class JobsEventService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsEventService.name);

  constructor(
    @Inject('QUEUE_EVENTS') private readonly queueEvents: QueueEvents,
    @Inject('QUEUE') private readonly queue: Queue,
  ) {}

  async watchJob(jobId: string): Promise<Observable<SseMessageEvent>> {
    // Check if job already completed/failed before subscribing to events
    const job = await this.queue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      if (state === 'completed') {
        this.logger.log(`Job ${jobId} already completed`);
        return new Observable((subscriber) => {
          subscriber.next({
            data: JSON.stringify(job.returnvalue),
            type: 'completed',
          });
          subscriber.complete();
        });
      }
      if (state === 'failed') {
        this.logger.log(`Job ${jobId} already failed`);
        return new Observable((subscriber) => {
          subscriber.next({
            data: job.failedReason ?? 'Unknown error',
            type: 'failed',
          });
          subscriber.complete();
        });
      }
    }

    const subject = new Subject<SseMessageEvent>();

    const onCompleted = (event: { jobId: string; returnvalue: string }) => {
      if (event.jobId === jobId) {
        subject.next({ data: event.returnvalue, type: 'completed' });
        subject.complete();
      }
    };

    const onFailed = (event: { jobId: string; failedReason: string }) => {
      if (event.jobId === jobId) {
        subject.next({ data: event.failedReason, type: 'failed' });
        subject.complete();
      }
    };

    const onProgress = (event: { jobId: string; data: unknown }) => {
      if (event.jobId === jobId) {
        subject.next({
          data: JSON.stringify(event.data),
          type: 'progress',
        });
      }
    };

    this.queueEvents.on('completed', onCompleted);
    this.queueEvents.on('failed', onFailed);
    this.queueEvents.on('progress', onProgress);

    return subject.pipe(
      finalize(() => {
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
        this.queueEvents.off('progress', onProgress);
      }),
    );
  }

  onModuleDestroy() {
    this.queueEvents.close().catch(() => {});
  }
}
