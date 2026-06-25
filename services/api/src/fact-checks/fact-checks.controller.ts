import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FactChecksService } from './fact-checks.service';

@Controller('fact-checks')
export class FactChecksController {
  constructor(private readonly factChecksService: FactChecksService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchVerdicts(
    @Query('q') query = '',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.factChecksService.searchVerdicts(
      query,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    );
  }

  @Get()
  getLatestChecks() {
    return this.factChecksService.getLatestChecks();
  }
}
