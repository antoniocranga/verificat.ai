import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  SearchService,
  ClaimEmbedding,
  MatchClaimResult,
} from './search.service';
import { SaveEmbeddingDto } from './dto/save-embedding.dto';
import { SearchClaimsDto } from './dto/search-claims.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('claims')
  @HttpCode(HttpStatus.OK)
  async searchClaims(
    @Body() dto: SearchClaimsDto,
  ): Promise<MatchClaimResult[]> {
    return this.searchService.searchSimilarClaims(
      dto.embedding,
      dto.threshold,
      dto.limit,
    );
  }

  @Post('embeddings')
  async saveEmbedding(@Body() dto: SaveEmbeddingDto): Promise<ClaimEmbedding> {
    return this.searchService.insertEmbedding(dto.claimId, dto.embedding);
  }
}
