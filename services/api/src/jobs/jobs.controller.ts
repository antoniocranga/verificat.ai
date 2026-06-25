import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  Sse,
  Logger,
  HttpCode,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Public } from '../auth/public.decorator';
import { JobsService } from './jobs.service';
import { JobsEventService } from './jobs-event.service';
import { Observable } from 'rxjs';

interface SseMessageEvent {
  data: string;
  id?: string;
  type?: string;
  retry?: number;
}

@Public()
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsEventService: JobsEventService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  async uploadAudio(@Req() req: Request) {
    const rawChunks: Uint8Array[] = [];
    for await (const chunk of req) {
      rawChunks.push(chunk as Uint8Array);
    }
    if (rawChunks.length === 0) {
      throw new UnprocessableEntityException('No audio data received');
    }
    const audioBuffer = Buffer.concat(rawChunks);

    const tmpDir = path.join(process.cwd(), 'tmp', 'uploads');
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `${crypto.randomUUID()}.webm`);
    fs.writeFileSync(tmpFile, audioBuffer);

    const result = await this.jobsService.enqueueFromAudio(tmpFile);

    return { jobId: result.jobId, claimId: result.claimId };
  }

  @Get(':jobId/stream')
  @Sse()
  streamJob(@Param('jobId') jobId: string): Observable<SseMessageEvent> {
    this.logger.log(`SSE subscription for job ${jobId}`);
    return this.jobsEventService.watchJob(jobId);
  }
}
