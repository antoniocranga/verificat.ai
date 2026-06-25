import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [RedisService],
  exports: [RedisService],
})
export class AuthModule {}
