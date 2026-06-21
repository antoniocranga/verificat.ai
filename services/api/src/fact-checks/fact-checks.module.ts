import { Module } from '@nestjs/common';
import { FactChecksController } from './fact-checks.controller';
import { FactChecksService } from './fact-checks.service';
import { ClaimDetectionService } from './claim-detection.service';

@Module({
  controllers: [FactChecksController],
  providers: [FactChecksService, ClaimDetectionService],
  exports: [ClaimDetectionService],
})
export class FactChecksModule {}
