import { Controller, Get, Post, Param, Body, Req, UnauthorizedException, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Patch('reports/:id/resolve')
  async resolveReport(
    @Param('id') id: string,
    @Body('note') resolutionNote: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedException('Admin authentication required');
    }

    await this.adminService.resolveReport(id, resolutionNote, userId);
    return { success: true };
  }
}
