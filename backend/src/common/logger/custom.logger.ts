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

  private static readonly FILTERED_CONTEXTS = new Set([
    'NestFactory',
    'InstanceLoader',
    'RouterExplorer',
    'RoutesResolver',
    'NestApplication',
    'Bootstrap',
  ]);

  log(message: unknown, context?: string): void {
    const ctx = context ?? this.context;
    // Skip framework logs to avoid spam in serverless environment
    if (ctx && CustomLogger.FILTERED_CONTEXTS.has(ctx)) {
      return;
    }

    const formatted = this.formatWithUser(message);
    super.log(formatted, context);

    if (CustomLogger.sentryInitialized) {
      Sentry.logger.info(formatted, { context: context ?? this.context });
    }
  }

  warn(message: unknown, context?: string): void {
    const formatted = this.formatWithUser(message);
    super.warn(formatted, context);

    if (CustomLogger.sentryInitialized) {
      Sentry.logger.warn(formatted, { context: context ?? this.context });
    }
  }

  debug(message: unknown, context?: string): void {
    const formatted = this.formatWithUser(message);
    super.debug(formatted, context);

    if (CustomLogger.sentryInitialized) {
      Sentry.logger.debug(formatted, { context: context ?? this.context });
    }
  }

  verbose(message: unknown, context?: string): void {
    const formatted = this.formatWithUser(message);
    super.verbose(formatted, context);

    if (CustomLogger.sentryInitialized) {
      Sentry.logger.trace(formatted, { context: context ?? this.context });
    }
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
    const ip = requestContext?.ip;
    if (user || ip) {
      Sentry.setUser({
        id: user?.id,
        username: user?.username ?? ip, // Use IP as fallback ID if user is not authenticated
        ip_address: ip,
      });
    }

    Sentry.captureException(error, { extra });
    Sentry.logger.error(this.formatWithUser(message), extra);
  }
}
