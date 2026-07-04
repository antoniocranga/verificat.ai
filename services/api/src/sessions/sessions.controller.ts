import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Post,
  Body,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Public } from '../auth/public.decorator';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Public()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body('mode') mode: string,
    @Body('deviceId') deviceId?: string,
  ) {
    if (mode !== 'realtime' && mode !== 'recording') {
      throw new BadRequestException('mode must be "realtime" or "recording"');
    }
    return this.sessionsService.createSession({
      mode: mode,
      deviceId,
    });
  }

  @Get()
  async listSessions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('deviceId') deviceId?: string,
  ) {
    return this.sessionsService.listSessions({
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
      deviceId,
    });
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    if (!UUID_RE.test(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    const session = await this.sessionsService.getSessionById(id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Param('id') id: string) {
    if (!UUID_RE.test(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    await this.sessionsService.deleteSession(id);
  }
}
