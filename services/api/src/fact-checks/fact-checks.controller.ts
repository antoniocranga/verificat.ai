import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { FactChecksService } from './fact-checks.service';

@Public()
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

  @Get(':id')
  async getVerdictById(@Param('id') id: string) {
    const verdict = await this.factChecksService.getVerdictById(id);
    if (!verdict) throw new NotFoundException('Verdict not found');
    return verdict;
  }

  @Get()
  getLatestChecks() {
    return this.factChecksService.getLatestChecks();
  }
}
