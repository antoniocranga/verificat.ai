import { Module } from '@nestjs/common';
import { FactChecksController } from './fact-checks.controller';
import { FactChecksService } from './fact-checks.service';

@Module({
  controllers: [FactChecksController],
  providers: [FactChecksService],
})
export class FactChecksModule {}
