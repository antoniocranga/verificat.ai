import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { RedisService } from './redis.service';
import { IS_PUBLIC_KEY } from './public.decorator';

interface SupabaseJwtPayload extends jwt.JwtPayload {
  session_id?: string;
  role?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret =
      process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev';

    try {
      const payload = jwt.verify(token, jwtSecret) as SupabaseJwtPayload;

      if (payload.session_id) {
        const isBlacklisted = await this.redisService.isSessionBlacklisted(
          payload.session_id,
        );
        if (isBlacklisted) {
          throw new UnauthorizedException('Session is revoked');
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (request as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
