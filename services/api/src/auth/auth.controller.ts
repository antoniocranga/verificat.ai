import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly redisService: RedisService) {}

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  async revoke(@Body('sessionId') sessionId: string) {
    if (sessionId) {
      await this.redisService.blacklistSession(sessionId, 900);
    }
    return { success: true };
  }
}
