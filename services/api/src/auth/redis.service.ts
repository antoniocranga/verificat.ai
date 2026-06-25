import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  async onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    await this.client.ping();
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  getClient(): Redis {
    return this.client;
  }

  async blacklistSession(sessionId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(
      `revoked_sessions:${sessionId}`,
      '1',
      'EX',
      ttlSeconds,
    );
  }

  async isSessionBlacklisted(sessionId: string): Promise<boolean> {
    const result = await this.client.get(`revoked_sessions:${sessionId}`);
    return result !== null;
  }
}
