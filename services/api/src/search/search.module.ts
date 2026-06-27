import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService, SEARCH_PROVIDER } from './search.service';
import { PgVectorSearchProvider } from './providers/pgvector-search.provider';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: SEARCH_PROVIDER,
      useClass: PgVectorSearchProvider,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
