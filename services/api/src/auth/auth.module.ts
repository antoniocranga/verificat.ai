import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [RedisService],
  exports: [RedisService],
})
export class AuthModule {}
