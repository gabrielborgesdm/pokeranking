import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
}

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private readonly isInitialized: boolean;

  constructor(
    @Inject('SENTRY_INIT') sentryInit: { initialized: boolean },
    private readonly configService: ConfigService,
  ) {
    this.isInitialized = sentryInit.initialized;

    if (!this.isInitialized) {
      this.logger.warn(
        'Sentry DSN not configured. Error tracking is disabled.',
      );
    }
  }

  captureException(
    exception: Error,
    context?: Record<string, unknown>,
  ): string | undefined {
    if (!this.isInitialized) {
      return undefined;
    }

    return Sentry.captureException(exception, {
      extra: context,
    });
  }

  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, unknown>,
  ): string | undefined {
    if (!this.isInitialized) {
      return undefined;
    }

    return Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  setUser(user: SentryUser | null): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.addBreadcrumb(breadcrumb);
  }

  setContext(name: string, context: Record<string, unknown> | null): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setContext(name, context);
  }

  isEnabled(): boolean {
    return this.isInitialized;
  }
}
