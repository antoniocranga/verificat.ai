import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { RedisService } from './auth/redis.service';
import { UsersModule } from './users/users.module';
import { FactChecksModule } from './fact-checks/fact-checks.module';
import { SourcesModule } from './sources/sources.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRootAsync({
      imports: [AuthModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: Number(process.env.THROTTLE_TTL) || 60000,
            limit: Number(process.env.THROTTLE_LIMIT) || 100,
          },
        ],
        storage: new ThrottlerStorageRedisService(redisService.getClient()),
      }),
    }),
    BullModule.forRootAsync({
      imports: [AuthModule],
      inject: [RedisService],
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        return {
          connection: {
            url: redisUrl,
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
