import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { RedisService } from './auth/redis.service';
import { UsersModule } from './users/users.module';
import { FactChecksModule } from './fact-checks/fact-checks.module';
import { SourcesModule } from './sources/sources.module';
import { AdminModule } from './admin/admin.module';

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
    UsersModule,
    FactChecksModule,
    SourcesModule,
    AdminModule,
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
