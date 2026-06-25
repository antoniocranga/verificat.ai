import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FactChecksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client(): SupabaseClient {
    return this.supabaseService.getClient();
  }

  async searchVerdicts(query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;

    const { data, error, count } = await this.client
      .from('verdicts')
      .select(
        `
        id,
        verdict,
        confidence_score,
        explanation,
        created_at,
        fact_checks!inner(
          claims!inner(text)
        )
      `,
        { count: 'exact' },
      )
      .or(
        `explanation.ilike.${searchTerm},fact_checks.claims.text.ilike.${searchTerm}`,
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []).map((v: Record<string, unknown>) => ({
        id: v.id,
        verdict: v.verdict,
        confidenceScore: v.confidence_score,
        explanation: v.explanation,
        createdAt: v.created_at,
        claim: (v.fact_checks as Record<string, unknown>)?.claims as Record<string, unknown> ?? {},
      })),
      total: count || 0,
      page,
      limit,
    };
  }

  getLatestChecks() {
    return this.searchVerdicts('', 1, 10);
  }
}
