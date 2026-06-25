import {
  Controller, Post, Body, HttpCode, HttpStatus, Request, NotFoundException,
  BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RedisService } from './redis.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Public } from './public.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { sub?: string; email?: string; session_id?: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  async revoke(@Body('sessionId') sessionId: string) {
    if (sessionId) {
      await this.redisService.blacklistSession(sessionId, 900);
    }
    return { success: true };
  }

  @Post('handoff')
  @HttpCode(HttpStatus.CREATED)
  async generateHandoff(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    const userSessionId = req.user?.session_id;
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const supabase = this.supabaseService.getClient();
    const result = await (supabase as any)
      .from('handoff_tokens')
      .insert({
        user_id: userId,
        session_id: userSessionId,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .select('token, expires_at')
      .single();

    if (result.error || !result.data) {
      throw new BadRequestException('Failed to generate handoff token');
    }

    return {
      token: result.data.token,
      expiresAt: result.data.expires_at,
      url: `${process.env.WEB_ORIGIN || 'https://verificat.xyz'}/handoff/${result.data.token}`,
    };
  }

  @Public()
  @Post('handoff/claim')
  @HttpCode(HttpStatus.OK)
  async claimHandoff(@Body() body: { token: string }) {
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }

    const supabase = this.supabaseService.getClient();

    const lookupResult = await (supabase as any)
      .from('handoff_tokens')
      .select('*')
      .eq('token', body.token)
      .single();

    if (lookupResult.error || !lookupResult.data) {
      throw new NotFoundException('Invalid handoff token');
    }

    if (lookupResult.data.used_at) {
      throw new BadRequestException('Handoff token has already been used');
    }

    if (new Date(lookupResult.data.expires_at) < new Date()) {
      throw new BadRequestException('Handoff token has expired');
    }

    const updateResult = await (supabase as any)
      .from('handoff_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', body.token);

    if (updateResult.error) {
      throw new BadRequestException('Failed to claim handoff token');
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      lookupResult.data.user_id,
    );

    if (userError || !userData.user?.email) {
      throw new BadRequestException('User not found');
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
      options: {
        redirectTo: `${process.env.MOBILE_REDIRECT_URL || 'verificat://auth/callback'}`,
      },
    });

    if (linkError || !linkData) {
      throw new BadRequestException('Failed to generate sign-in link');
    }

    return {
      url: linkData.properties?.action_link || linkData.properties?.email_otp || '',
    };
  }
}