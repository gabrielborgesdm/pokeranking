import { config } from 'dotenv';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Load .env before accessing SENTRY_DSN
config();

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  const environment =
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  Sentry.init({
    dsn,
    environment,
    integrations: (integrations) => [
      ...integrations.filter((i) => i.name !== 'Mongo'),
      nodeProfilingIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
  });
}
