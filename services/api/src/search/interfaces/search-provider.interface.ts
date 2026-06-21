import { ClaimEmbedding, MatchClaimResult } from '../search.service';

export interface SearchProvider {
  insertEmbedding(
    claimId: string,
    embedding: number[],
  ): Promise<ClaimEmbedding>;

  searchSimilarClaims(
    embedding: number[],
    threshold?: number,
    limit?: number,
  ): Promise<MatchClaimResult[]>;
}
