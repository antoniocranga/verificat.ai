/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MetricsService } from '../metrics/metrics.service';

export interface SessionRow {
  id: string;
  created_at: string;
  device_id: string | null;
  mode: 'realtime' | 'recording';
  started_at: string;
  ended_at: string | null;
  claim_count: number;
  verdict_summary: Record<string, number>;
}

export interface SessionListItem {
  id: string;
  mode: 'realtime' | 'recording';
  startedAt: string;
  endedAt: string | null;
  claimCount: number;
  verdictSummary: Record<string, number>;
}

export interface SessionDetail extends SessionListItem {
  claims: Array<{
    id: string;
    text: string;
    verdict: {
      id: string;
      label: string;
      confidence: number;
      explanation: string;
      sources: Array<{
        id: string;
        url: string;
        title: string;
        trustScore: number;
      }>;
    } | null;
  }>;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly metrics: MetricsService,
  ) {}

  async createSession(params: {
    mode: 'realtime' | 'recording';
    deviceId?: string;
  }): Promise<{ id: string }> {
    const supabase = this.supabaseService.getClient() as any;

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        mode: params.mode,
        device_id: params.deviceId || null,
        claim_count: 0,
        verdict_summary: {},
      })
      .select('id')
      .single();

    if (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw new Error('Failed to create session');
    }

    return { id: (data as { id: string }).id };
  }

  async updateSessionOnDisconnect(
    sessionId: string,
    claims: Array<{ verdict: string }>,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient() as any;
    const verdictSummary: Record<string, number> = {};

    for (const c of claims) {
      const key = c.verdict?.toLowerCase() || 'unknown';
      verdictSummary[key] = (verdictSummary[key] || 0) + 1;
    }

    let claimCount = claims.length;

    if (claimCount === 0) {
      const { count } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId);
      claimCount = (count as number) || 0;
    }

    const { error } = await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        claim_count: claimCount,
        verdict_summary: verdictSummary,
      })
      .eq('id', sessionId);

    if (error) {
      this.metrics.sessionsPersistedTotal.inc({ outcome: 'error' });
      this.logger.error(
        `Failed to finalize session ${sessionId}: ${error.message}`,
      );
      return;
    }

    this.metrics.sessionsPersistedTotal.inc({ outcome: 'success' });
  }

  async listSessions(params: {
    page?: number;
    limit?: number;
    deviceId?: string;
  }): Promise<{
    data: SessionListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const supabase = this.supabaseService.getClient() as any;
    let query = supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.deviceId) {
      query = query.eq('device_id', params.deviceId);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Failed to list sessions: ${error.message}`);
      throw new Error('Failed to list sessions');
    }

    const rows = (data || []) as SessionRow[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        mode: r.mode,
        startedAt: r.started_at,
        endedAt: r.ended_at,
        claimCount: r.claim_count,
        verdictSummary: r.verdict_summary,
      })),
      total: (count as number) || 0,
      page,
      limit,
    };
  }

  async getSessionById(id: string): Promise<SessionDetail | null> {
    const supabase = this.supabaseService.getClient() as any;

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError || !sessionData) return null;

    const session = sessionData as SessionRow;

    const { data: claimsData } = await supabase
      .from('claims')
      .select(
        `
        id,
        text,
        fact_checks!inner(
          id,
          verdicts!inner(
            id,
            verdict,
            confidence_score,
            explanation,
            verdict_sources(
              sources(
                id,
                url,
                name,
                trust_score
              )
            )
          )
        )
      `,
      )
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    const claims = (
      (claimsData || []) as Array<{
        id: string;
        text: string;
        fact_checks: Array<{
          id: string;
          verdicts: Array<{
            id: string;
            verdict: string;
            confidence_score: number;
            explanation: string;
            verdict_sources: Array<{
              sources: {
                id: string;
                url: string;
                name: string;
                trust_score: number;
              };
            }>;
          }>;
        }>;
      }>
    ).map((c) => {
      const verdictRow = c.fact_checks?.[0]?.verdicts?.[0];
      const rawSources = verdictRow?.verdict_sources || [];
      const sources = rawSources.map((vs) => ({
        id: vs.sources.id,
        url: vs.sources.url,
        title: vs.sources.name,
        trustScore: vs.sources.trust_score,
      }));

      return {
        id: c.id,
        text: c.text,
        verdict: verdictRow
          ? {
              id: verdictRow.id,
              label: verdictRow.verdict,
              confidence: verdictRow.confidence_score,
              explanation: verdictRow.explanation,
              sources,
            }
          : null,
      };
    });

    return {
      id: session.id,
      mode: session.mode,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      claimCount: session.claim_count,
      verdictSummary: session.verdict_summary,
      claims,
    };
  }

  async deleteSession(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient() as any;

    const { data: claims } = await supabase
      .from('claims')
      .select('id')
      .eq('session_id', id);

    if (claims && (claims as Array<{ id: string }>).length > 0) {
      const claimIds = (claims as Array<{ id: string }>).map((c) => c.id);

      await supabase.from('fact_checks').delete().in('claim_id', claimIds);
      await supabase.from('claims').delete().in('id', claimIds);
    }

    const { error } = await supabase.from('sessions').delete().eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete session ${id}: ${error.message}`);
      throw new Error('Failed to delete session');
    }
  }
}
