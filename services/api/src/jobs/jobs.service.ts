import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('fact-verification')
    private readonly factVerificationQueue: Queue,
  ) {}

  async enqueueVerification(claimId: string, text: string) {
    const job = await this.factVerificationQueue.add(
      'verify',
      { claimId, text },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
    return { jobId: job.id };
  }

  async enqueueFromAudio(audioPath: string) {
    const claimId = crypto.randomUUID();
    const job = await this.factVerificationQueue.add(
      'verify',
      { claimId, audioPath },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
    this.logger.log(`Enqueued job ${job.id} for audio file ${audioPath}`);
    return { jobId: job.id, claimId };
  }

  async getJobStatus(jobId: string) {
    const job = await this.factVerificationQueue.getJob(jobId);
    if (!job) {
      return null;
    }
    const state = await job.getState();
    return {
      id: job.id,
      state,
      data: job.data as unknown,
      returnValue: job.returnvalue as unknown,
      failedReason: job.failedReason,
    };
  }
}
