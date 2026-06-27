import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { SourceTrustService } from './source-trust.service';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [SourcesController],
  providers: [SourcesService, SourceTrustService],
  exports: [SourceTrustService],
})
export class SourcesModule {}
