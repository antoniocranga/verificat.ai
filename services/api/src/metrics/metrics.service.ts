import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public readonly httpRequestsTotal: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    public readonly httpRequestDurationSeconds: Histogram<string>,

    @InjectMetric('active_websocket_connections')
    public readonly activeWsConnections: Gauge<string>,

    @InjectMetric('stt_sessions_total')
    public readonly sttSessionsTotal: Counter<string>,

    @InjectMetric('stt_mock_sessions_total')
    public readonly sttMockSessionsTotal: Counter<string>,

    @InjectMetric('stt_low_confidence_segments_total')
    public readonly sttLowConfidenceSegmentsTotal: Counter<string>,

    @InjectMetric('stt_session_duration_seconds')
    public readonly sttSessionDurationSeconds: Histogram<string>,

    @InjectMetric('stt_segments_finalized_total')
    public readonly sttSegmentsFinalizedTotal: Counter<string>,

    @InjectMetric('stt_segments_dropped_total')
    public readonly sttSegmentsDroppedTotal: Counter<string>,

    @InjectMetric('factcheck_requests_total')
    public readonly factcheckRequestsTotal: Counter<string>,

    @InjectMetric('factcheck_request_duration_seconds')
    public readonly factcheckRequestDurationSeconds: Histogram<string>,

    @InjectMetric('factcheck_verdicts_total')
    public readonly factcheckVerdictsTotal: Counter<string>,

    @InjectMetric('claim_result_sent_total')
    public readonly claimResultSentTotal: Counter<string>,

    @InjectMetric('sessions_persisted_total')
    public readonly sessionsPersistedTotal: Counter<string>,
  ) {}
}
