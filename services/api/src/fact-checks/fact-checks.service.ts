import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    let req = this.client
      .from('verdicts')
      .select(
        `
        id,
        verdict,
        confidence_score,
        explanation,
        created_at,
        fact_checks!inner(
          claims!inner(id, text)
        )
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query) {
      const searchTerm = `%${query}%`;
      req = req.or(`explanation.ilike.${searchTerm}`);
    }

    const { data, error, count } = await req;
    if (error)
      throw new InternalServerErrorException(
        error.message || 'Database query failed',
      );

    return {
      data: (data || []).map((v: Record<string, unknown>) => ({
        id: v.id,
        verdict: v.verdict,
        confidenceScore: v.confidence_score,
        explanation: v.explanation,
        createdAt: v.created_at,
        claim:
          ((v.fact_checks as Record<string, unknown>)?.claims as Record<
            string,
            unknown
          >) ?? {},
      })),
      total: count || 0,
      page,
      limit,
    };
  }

  async getVerdictById(id: string) {
    const { data, error } = await this.client
      .from('verdicts')
      .select(
        `
        id,
        verdict,
        confidence_score,
        explanation,
        created_at,
        fact_checks!inner(
          claim_id,
          claims!inner(id, text)
        ),
        verdict_sources(
          sources(
            id,
            url,
            name,
            trust_score
          )
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error)
      throw new InternalServerErrorException(
        error.message || 'Database query failed',
      );
    if (!data) return null;

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
    const d = data as any;

    const rawSources: any[] = d.verdict_sources ?? [];
    const sources = rawSources.map((vs: any) => {
      const s = vs.sources;
      return {
        id: s.id,
        url: s.url,
        title: s.name,
        trustScore: s.trust_score,
        trustScoreExplanation: '',
        retrievedAt: '',
      };
    });

    return {
      id: d.id,
      label: d.verdict,
      confidence: d.confidence_score,
      explanation: d.explanation,
      createdAt: d.created_at,
      claimId: d.fact_checks?.claim_id ?? '',
      sources,
      sessionId: '',
    };
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
  }

  getLatestChecks() {
    return this.searchVerdicts('', 1, 10);
  }

  async reportVerdict(verdictId: string, reason: string, description: string, userId?: string) {
    const { data: verdict, error: verdictError } = await this.client
      .from('verdicts')
      .select('fact_checks(claim_id)')
      .eq('id', verdictId)
      .single();

    if (verdictError || !verdict) {
      throw new NotFoundException('Verdict not found');
    }

    const claimId = (verdict.fact_checks as Record<string, any>)?.claim_id;

    const { data, error } = await this.client.from('reports').insert({
      verdict_id: verdictId,
      claim_id: claimId,
      reason,
      description,
      reported_by: userId || null,
      status: 'open',
    } as any).select().single();

    if (error) {
      throw new InternalServerErrorException(error.message || 'Failed to submit report');
    }

    return data;
  }
}
