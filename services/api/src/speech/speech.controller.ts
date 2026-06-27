import {
  Controller,
  Post,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/public.decorator';
import { SpeechService } from './speech.service';

@Public()
@Controller('speech')
export class SpeechController {
  private readonly logger = new Logger(SpeechController.name);

  constructor(private readonly speechService: SpeechService) {}

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  async transcribeAudio(@Req() req: Request) {
    const rawChunks: Uint8Array[] = [];
    for await (const chunk of req) {
      rawChunks.push(chunk as Uint8Array);
    }
    if (rawChunks.length === 0) {
      throw new UnprocessableEntityException('No audio data received');
    }
    const audioBuffer = Buffer.concat(rawChunks);

    try {
      this.logger.log(
        `Transcribing audio buffer of size ${audioBuffer.length} bytes`,
      );
      const adapter = this.speechService.getAdapter('deepgram'); // Default to Deepgram or logic
      const result = await adapter.transcribeBuffer(audioBuffer);
      return { transcript: result.text };
    } catch (err) {
      this.logger.error(`Failed to transcribe audio: ${String(err)}`);
      throw new UnprocessableEntityException('Audio transcription failed');
    }
  }
}
