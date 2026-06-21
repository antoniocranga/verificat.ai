/* eslint-disable @typescript-eslint/unbound-method */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RedisService } from './redis.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let redisService: jest.Mocked<RedisService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    redisService = {
      isSessionBlacklisted: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new AuthGuard(redisService, reflector);
    process.env.SUPABASE_JWT_SECRET = 'test-secret';
  });

  const mockContext = (authHeader?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token signature is invalid', async () => {
    const context = mockContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow valid token not in blacklist', async () => {
    const payload = { session_id: 'session-123' };
    const token = jwt.sign(payload, 'test-secret');
    const context = mockContext(`Bearer ${token}`);

    redisService.isSessionBlacklisted.mockResolvedValue(false);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(redisService.isSessionBlacklisted).toHaveBeenCalledWith(
      'session-123',
    );
  });

  it('should throw UnauthorizedException if session is blacklisted', async () => {
    const payload = { session_id: 'session-123' };
    const token = jwt.sign(payload, 'test-secret');
    const context = mockContext(`Bearer ${token}`);

    redisService.isSessionBlacklisted.mockResolvedValue(true);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
