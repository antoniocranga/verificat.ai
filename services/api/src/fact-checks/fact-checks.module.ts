import { Module } from '@nestjs/common';
import { FactChecksController } from './fact-checks.controller';
import { FactChecksService } from './fact-checks.service';
import { FactCheckPersistenceService } from './fact-check-persistence.service';
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
    FactCheckPersistenceService,
    ClaimDetectionService,
    EvidenceRetrievalService,
    VerdictGenerationService,
  ],
  exports: [
    FactCheckPersistenceService,
    ClaimDetectionService,
    EvidenceRetrievalService,
    VerdictGenerationService,
  ],
})
export class FactChecksModule {}
