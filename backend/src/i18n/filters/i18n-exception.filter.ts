import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../../sentry/sentry.service';

interface I18nExceptionPayload {
  key: string;
  args?: Record<string, string | number>;
}

type ExceptionResponseObject = Record<string, unknown>;

interface RequestUser {
  _id?: string;
  email?: string;
  username?: string;
}

type AuthenticatedRequest = Request & { user?: RequestUser };

interface ErrorResponsePayload {
  message: string | string[];
  key?: string;
  args?: Record<string, string | number>;
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
  constructor(private readonly sentryService: SentryService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Capture 5xx errors to Sentry
    if (status >= 500) {
      this.captureToSentry(exception, request);
    }

    const { message, key, args } = this.extractPayload(exceptionResponse);

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      key,
      args,
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

  private extractPayload(exceptionResponse: string | object): ErrorResponsePayload {
    if (typeof exceptionResponse === 'string') {
      return { message: exceptionResponse };
    }

    if (!isObject(exceptionResponse)) {
      return { message: 'Internal server error', key: 'common.internalError' };
    }

    // Check if root object is an i18n payload (e.g., { key: "common.error", args: {...} })
    if (isI18nPayload(exceptionResponse)) {
      return {
        message: exceptionResponse.key,
        key: exceptionResponse.key,
        args: exceptionResponse.args,
      };
    }

    return this.extractFromMessageField(exceptionResponse);
  }

  private extractFromMessageField(
    responseObj: ExceptionResponseObject,
  ): ErrorResponsePayload {
    const { message } = responseObj;

    if (Array.isArray(message)) {
      // For validation errors (array of messages), return as-is without translation keys
      return { message: message.map(String) };
    }

    if (isI18nPayload(message)) {
      return {
        message: message.key,
        key: message.key,
        args: message.args,
      };
    }

    if (typeof message === 'string') {
      // Check if it looks like a translation key (contains a dot)
      if (message.includes('.')) {
        return { message, key: message };
      }
      return { message };
    }

    if (typeof message === 'number') {
      return { message: String(message) };
    }

    return { message: 'Internal server error', key: 'common.internalError' };
  }
}
