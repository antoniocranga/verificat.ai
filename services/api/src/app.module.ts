import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { UsersModule } from './users/users.module';
import { FactChecksModule } from './fact-checks/fact-checks.module';
import { SourcesModule } from './sources/sources.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SearchModule } from './search/search.module';
import { SpeechModule } from './speech/speech.module';
import { AudioModule } from './audio/audio.module';
import { SafeFetcherModule } from './common/safe-fetcher/safe-fetcher.module';

@Module({
  imports: [
    AuthModule,
    SpeechModule,
    AudioModule,
    SafeFetcherModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: Number(process.env.THROTTLE_TTL) || 60000,
          limit: Number(process.env.THROTTLE_LIMIT) || 100,
        },
      ],
    }),
    BullModule.forRootAsync({
      useFactory: () => {
        const u = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        const m = u.match(/redis:\/\/([^:]+):(\d+)/);
        return {
          connection: {
            host: m?.[1] || '127.0.0.1',
            port: parseInt(m?.[2] || '6379', 10),
          },
        };
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      {
        name: 'fact-verification',
        adapter: BullMQAdapter,
      },
      {
        name: 'fact-verification-dlq',
        adapter: BullMQAdapter,
      },
    ),
    UsersModule,
    FactChecksModule,
    SourcesModule,
    AdminModule,
    JobsModule,
    SupabaseModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
