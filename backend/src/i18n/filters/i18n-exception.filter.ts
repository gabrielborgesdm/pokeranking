import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { SentryService } from '../../sentry/sentry.service';

interface I18nExceptionPayload {
  key: string;
  args?: Record<string, string | number>;
}

type ExceptionResponseObject = Record<string, unknown>;

interface AuthenticatedRequest extends Request {
  user?: { _id?: string; email?: string; username?: string };
}

function isI18nPayload(value: unknown): value is I18nExceptionPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    typeof (value as I18nExceptionPayload).key === 'string'
  );
}

function isObject(value: unknown): value is ExceptionResponseObject {
  return typeof value === 'object' && value !== null;
}

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(I18nExceptionFilter.name);

  constructor(private readonly sentryService: SentryService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const i18n = I18nContext.current(host);

    // Capture 5xx errors to Sentry
    if (status >= 500) {
      this.captureToSentry(exception, request);
    }

    const message = this.extractMessage(exceptionResponse, i18n);

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }

  private captureToSentry(
    exception: HttpException,
    request: AuthenticatedRequest,
  ): void {
    const user = request.user;

    if (user?._id) {
      this.sentryService.setUser({
        id: user._id,
        email: user.email,
        username: user.username,
      });
    }

    this.sentryService.captureException(exception, {
      url: request.url,
      method: request.method,
      statusCode: exception.getStatus(),
      body: request.body,
      query: request.query,
      params: request.params,
    });
  }

  private extractMessage(
    exceptionResponse: string | object,
    i18n: I18nContext | undefined,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return this.translateIfKey(exceptionResponse, i18n);
    }

    if (!isObject(exceptionResponse)) {
      return this.translateIfKey('common.internalError', i18n);
    }

    // Check if root object is an i18n payload first (e.g., { key: "common.error" })
    if (isI18nPayload(exceptionResponse)) {
      return this.translatePayload(exceptionResponse, i18n);
    }

    return this.extractFromMessageField(exceptionResponse, i18n);
  }

  private extractFromMessageField(
    responseObj: ExceptionResponseObject,
    i18n: I18nContext | undefined,
  ): string | string[] {
    const { message } = responseObj;

    if (Array.isArray(message)) {
      return this.translateMessageArray(message, i18n);
    }

    if (isI18nPayload(message)) {
      return this.translatePayload(message, i18n);
    }

    if (typeof message === 'string') {
      return this.translateIfKey(message, i18n);
    }

    if (typeof message === 'number') {
      return String(message);
    }

    return this.translateIfKey('common.internalError', i18n);
  }

  private translateMessageArray(
    messages: unknown[],
    i18n: I18nContext | undefined,
  ): string[] {
    return messages.map((msg) => {
      if (isI18nPayload(msg)) {
        return this.translatePayload(msg, i18n);
      }
      if (typeof msg === 'string') {
        return this.translateIfKey(msg, i18n);
      }
      return String(msg);
    });
  }

  private translatePayload(
    payload: I18nExceptionPayload,
    i18n: I18nContext | undefined,
  ): string {
    if (!i18n) {
      return payload.key;
    }
    return this.translate(i18n, payload.key, payload.args);
  }

  private translateIfKey(value: string, i18n: I18nContext | undefined): string {
    // Check if value looks like an i18n key (contains a dot, e.g., "common.error")
    if (!i18n || !value.includes('.')) {
      return value;
    }
    return this.translate(i18n, value);
  }

  private translate(
    i18n: I18nContext,
    key: string,
    args?: Record<string, string | number>,
  ): string {
    try {
      return String(i18n.t(key, { args }));
    } catch {
      this.logger.warn(`Translation failed for key: ${key}`);
      return key;
    }
  }
}
