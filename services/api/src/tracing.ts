import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const otelEnabled = process.env.OTEL_SDK_DISABLED !== 'true';

let sdk: NodeSDK | null = null;

if (otelEnabled) {
  const exporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      'http://localhost:4318/v1/traces',
  });

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'verificat-api',
    }),
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    console.log('[Tracing] OpenTelemetry SDK initialized successfully');
  } catch (error) {
    console.error('[Tracing] Failed to initialize OpenTelemetry SDK:', error);
  }

  process.on('SIGTERM', () => {
    if (sdk) {
      sdk
        .shutdown()
        .then(() => console.log('[Tracing] OpenTelemetry SDK terminated'))
        .catch((error) =>
          console.error(
            '[Tracing] Error shutting down OpenTelemetry SDK:',
            error,
          ),
        )
        .finally(() => process.exit(0));
    }
  });
} else {
  console.log('[Tracing] OpenTelemetry SDK is disabled');
}
