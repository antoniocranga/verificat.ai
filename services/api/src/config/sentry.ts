import * as Sentry from '@sentry/nestjs';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log(
      '[Sentry] SENTRY_DSN not configured. Skipping Sentry initialization.',
    );
    return;
  }

  const environment = process.env.NODE_ENV || 'development';
  console.log(
    `[Sentry] Initializing error tracking for environment: ${environment}`,
  );

  Sentry.init({
    dsn,
    environment,
    beforeSend(event) {
      // Scrub potential PII in request payloads and parameters
      if (event.request) {
        if (event.request.headers) {
          // Remove Authorization credentials
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        if (event.request.data && typeof event.request.data === 'string') {
          // Attempt to strip email or authorization token formats
          event.request.data = event.request.data
            .replace(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
              '[EMAIL]',
            )
            .replace(
              /bearer\s+[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/gi,
              '[BEARER TOKEN]',
            );
        }
      }
      return event;
    },
  });
}
