import { env } from '@/config/env';

/**
 * Initialize error telemetry. Sentry is loaded lazily and only when a DSN is
 * configured, so it stays out of the main bundle for self-hosted / DSN-less
 * deployments.
 */
export async function initTelemetry(): Promise<void> {
  if (!env.sentryDsn) return;
  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.network,
    tracesSampleRate: 0.1,
  });
}
