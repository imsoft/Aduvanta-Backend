/**
 * Sentry instrumentation. Imported first (before AppModule) so that Sentry's
 * async context tracking wraps every incoming request, database call, and
 * outgoing HTTP client.
 *
 * If `SENTRY_DSN` is not set at startup, this becomes a no-op so local dev
 * and CI remain unaffected.
 */
import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        if (event.request.cookies) {
          event.request.cookies = '[REDACTED]' as unknown as Record<
            string,
            string
          >;
        }
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, string>;
          if (headers.authorization) headers.authorization = '[REDACTED]';
          if (headers.cookie) headers.cookie = '[REDACTED]';
          if (headers['x-api-key']) headers['x-api-key'] = '[REDACTED]';
        }
        if (event.request.data && typeof event.request.data === 'object') {
          const data = event.request.data as Record<string, unknown>;
          for (const k of [
            'password',
            'newPassword',
            'token',
            'secret',
            'apiKey',
          ]) {
            if (k in data) data[k] = '[REDACTED]';
          }
        }
      }
      return event;
    },
  });
}
