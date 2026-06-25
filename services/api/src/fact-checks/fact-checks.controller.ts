import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { FactChecksService } from './fact-checks.service';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (!UUID_RE.test(id)) {
      throw new BadRequestException('Invalid verdict ID format');
    }
    const verdict = await this.factChecksService.getVerdictById(id);
    if (!verdict) throw new NotFoundException('Verdict not found');
    return verdict;
  }

  @Get()
  getLatestChecks() {
    return this.factChecksService.getLatestChecks();
  }
}
