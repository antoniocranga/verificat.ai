import { Injectable, Inject } from '@nestjs/common';
import { SearchProvider } from './interfaces/search-provider.interface';

export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';

export interface ClaimEmbedding {
  id: string;
  claim_id: string;
  embedding: number[];
  created_at?: string;
}

export interface MatchClaimResult {
  id: string;
  claim_id: string;
  text: string;
  similarity: number;
}

@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_PROVIDER) private readonly searchProvider: SearchProvider,
  ) {}

  async insertEmbedding(
    claimId: string,
    embedding: number[],
  ): Promise<ClaimEmbedding> {
    return this.searchProvider.insertEmbedding(claimId, embedding);
  }

  async searchSimilarClaims(
    embedding: number[],
    threshold = 0.7,
    limit = 5,
  ): Promise<MatchClaimResult[]> {
    return this.searchProvider.searchSimilarClaims(embedding, threshold, limit);
  }
}
