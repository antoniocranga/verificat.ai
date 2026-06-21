import { Controller, Get } from '@nestjs/common';
import { FactChecksService } from './fact-checks.service';

@Controller('fact-checks')
export class FactChecksController {
  constructor(private readonly factChecksService: FactChecksService) {}

  @Get()
  getLatestChecks() {
    return this.factChecksService.getLatestChecks();
  }
}
