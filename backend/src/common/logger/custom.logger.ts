import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { RequestContextService } from '../services/request-context.service';

/**
 * Custom logger that extends NestJS ConsoleLogger.
 * - Adds username prefix to all log messages when user is authenticated
 * - Sends error-level logs to Sentry with user context
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  private static sentryInitialized = false;

  static setSentryInitialized(initialized: boolean): void {
    CustomLogger.sentryInitialized = initialized;
  }

  private formatWithUser(message: unknown): string {
    const user = RequestContextService.getUser();
    const messageStr = typeof message === 'string' ? message : String(message);

    if (user) {
      return `[${user.username}] ${messageStr}`;
    }

    return messageStr;
  }

  log(message: unknown, context?: string): void {
    super.log(this.formatWithUser(message), context);
  }

  warn(message: unknown, context?: string): void {
    super.warn(this.formatWithUser(message), context);
  }

  debug(message: unknown, context?: string): void {
    super.debug(this.formatWithUser(message), context);
  }

  verbose(message: unknown, context?: string): void {
    super.verbose(this.formatWithUser(message), context);
  }

  error(message: unknown, stackOrContext?: string): void;
  error(message: unknown, stack?: string, context?: string): void;
  error(message: unknown, ...optionalParams: unknown[]): void {
    // Call parent with formatted message
    super.error(this.formatWithUser(message), ...optionalParams);

    // Send to Sentry if initialized
    if (!CustomLogger.sentryInitialized) {
      return;
    }

    const error =
      message instanceof Error ? message : new Error(String(message));

    // Build context from optional params
    const extra: Record<string, unknown> = {};

    if (optionalParams.length > 0) {
      const stack = optionalParams[0];
      const ctx = optionalParams[1];

      if (typeof stack === 'string') {
        extra.stack = stack;
      }
      if (typeof ctx === 'string') {
        extra.context = ctx;
      } else if (ctx !== undefined) {
        extra.context = ctx;
      }
    }

    // Add logger context if available
    if (this.context) {
      extra.loggerContext = this.context;
    }

    // Get request context (user, path, method)
    const requestContext = RequestContextService.get();
    if (requestContext) {
      if (requestContext.path) {
        extra.path = requestContext.path;
      }
      if (requestContext.method) {
        extra.method = requestContext.method;
      }
      if (requestContext.requestId) {
        extra.requestId = requestContext.requestId;
      }
    }

    // Set user in Sentry scope if available
    const user = RequestContextService.getUser();
    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.username,
      });
    }

    Sentry.captureException(error, { extra });
  }
}
