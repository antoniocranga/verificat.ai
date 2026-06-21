import { Module, Global } from '@nestjs/common';
import { SafeFetcherService } from './safe-fetcher.service';

@Global()
@Module({
  providers: [SafeFetcherService],
  exports: [SafeFetcherService],
})
export class SafeFetcherModule {}
