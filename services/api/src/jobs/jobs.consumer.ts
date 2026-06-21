import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('fact-verification')
export class JobsConsumer extends WorkerHost {
  private readonly logger = new Logger(JobsConsumer.name);

  async process(job: Job<{ claimId: string; text: string }>): Promise<{
    success: boolean;
    verdict: string;
    explanation: string;
  }> {
    this.logger.log(`Processing job ${job.id} for claim ${job.data.claimId}`);

    if (job.data.text && job.data.text.includes('fail')) {
      throw new Error(`Intentional job failure: ${job.data.text}`);
    }

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      verdict: 'True',
      explanation: 'Verified via mock consumer',
    };
  }
}
