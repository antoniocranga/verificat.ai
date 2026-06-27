import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
import { TestUserDto } from './dto/test-user.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    sub?: string;
    email?: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.sub || 'default-user-id';
    return this.usersService.getProfile(userId);
  }

  @Post('test-validation')
  testValidation(@Body() dto: TestUserDto) {
    return { success: true, ...dto };
  }
}
