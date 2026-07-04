import { Global, Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsMiddleware } from './metrics.middleware';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    MetricsService,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),
    makeGaugeProvider({
      name: 'active_websocket_connections',
      help: 'Active WebSocket connections',
    }),
    makeCounterProvider({
      name: 'stt_sessions_total',
      help: 'Total STT sessions',
      labelNames: ['outcome'],
    }),
    makeCounterProvider({
      name: 'stt_mock_sessions_total',
      help: 'Total STT mock sessions',
    }),
    makeCounterProvider({
      name: 'stt_low_confidence_segments_total',
      help: 'Total STT segments dropped due to low confidence',
    }),
    makeHistogramProvider({
      name: 'stt_session_duration_seconds',
      help: 'Duration of STT sessions',
      buckets: [5, 15, 30, 60, 120, 300, 600],
    }),
    makeCounterProvider({
      name: 'stt_segments_finalized_total',
      help: 'Total STT segments finalized',
    }),
    makeCounterProvider({
      name: 'stt_segments_dropped_total',
      help: 'Total STT segments dropped',
      labelNames: ['reason'],
    }),
    makeCounterProvider({
      name: 'factcheck_requests_total',
      help: 'Total factcheck requests',
      labelNames: ['outcome'],
    }),
    makeHistogramProvider({
      name: 'factcheck_request_duration_seconds',
      help: 'Duration of factcheck requests',
      buckets: [0.1, 0.5, 1, 2, 5, 10, 20],
    }),
    makeCounterProvider({
      name: 'factcheck_verdicts_total',
      help: 'Total factcheck verdicts',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: 'claim_result_sent_total',
      help: 'Total claim results sent to client',
    }),
    makeCounterProvider({
      name: 'sessions_persisted_total',
      help: 'Total sessions persisted',
      labelNames: ['outcome'],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
