import { Module } from '@nestjs/common';
import { FactChecksController } from './fact-checks.controller';
import { FactChecksService } from './fact-checks.service';
import { ClaimDetectionService } from './claim-detection.service';
import { EvidenceRetrievalService } from './evidence-retrieval.service';
import { VerdictGenerationService } from './verdict-generation.service';
import { SearchModule } from '../search/search.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SearchModule, SupabaseModule],
  controllers: [FactChecksController],
  providers: [
    FactChecksService,
    ClaimDetectionService,
    EvidenceRetrievalService,
    VerdictGenerationService,
  ],
  exports: [
    ClaimDetectionService,
    EvidenceRetrievalService,
    VerdictGenerationService,
  ],
})
export class FactChecksModule {}
