import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { SearchProvider } from '../interfaces/search-provider.interface';
import { ClaimEmbedding, MatchClaimResult } from '../search.service';

@Injectable()
export class PgVectorSearchProvider implements SearchProvider {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient() {
    return this.supabaseService.getClient() as unknown as {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => {
          select: () => {
            single: () => Promise<{
              data: unknown;
              error: { message: string } | null;
            }>;
          };
        };
      };
      rpc: (
        name: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
    };
  }

  async insertEmbedding(
    claimId: string,
    embedding: number[],
  ): Promise<ClaimEmbedding> {
    if (!claimId) {
      throw new BadRequestException('claimId is required');
    }
    if (!embedding || embedding.length !== 1536) {
      throw new BadRequestException(
        'embedding must be an array of length 1536',
      );
    }

    const { data, error } = await this.getClient()
      .from('claim_embeddings')
      .insert({ claim_id: claimId, embedding })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to insert embedding: ${error.message}`,
      );
    }

    return data as ClaimEmbedding;
  }

  async searchSimilarClaims(
    embedding: number[],
    threshold = 0.7,
    limit = 5,
  ): Promise<MatchClaimResult[]> {
    if (!embedding || embedding.length !== 1536) {
      throw new BadRequestException(
        'query embedding must be an array of length 1536',
      );
    }

    const { data, error } = await this.getClient().rpc('match_claims', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to perform similarity search: ${error.message}`,
      );
    }

    return data as MatchClaimResult[];
  }
}
