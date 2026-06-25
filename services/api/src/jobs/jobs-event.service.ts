import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import { Observable, Subject } from 'rxjs';

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
  ) {}

  watchJob(jobId: string): Observable<SseMessageEvent> {
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

    return subject.asObservable();
  }

  onModuleDestroy() {
    this.queueEvents.close().catch(() => {});
  }
}
