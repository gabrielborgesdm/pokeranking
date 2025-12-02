import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

interface I18nExceptionPayload {
  key: string;
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

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(I18nExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const i18n = I18nContext.current(host);

    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as Record<string, unknown>;

      if (responseObj.message) {
        if (Array.isArray(responseObj.message)) {
          // Validation errors - translate each if it's an i18n payload
          message = responseObj.message.map((msg) => {
            if (isI18nPayload(msg) && i18n) {
              return this.translate(i18n, msg.key, msg.args);
            }
            return String(msg);
          });
        } else if (isI18nPayload(responseObj.message)) {
          // Single i18n payload in message
          message = i18n
            ? this.translate(
                i18n,
                responseObj.message.key,
                responseObj.message.args,
              )
            : responseObj.message.key;
        } else if (isI18nPayload(responseObj)) {
          // The response object itself is an i18n payload
          message = i18n
            ? this.translate(
                i18n,
                responseObj.key,
                responseObj.args as Record<string, string | number>,
              )
            : responseObj.key;
        } else if (
          typeof responseObj.message === 'string' ||
          typeof responseObj.message === 'number'
        ) {
          message = String(responseObj.message);
        } else {
          message = 'An error occurred';
        }
      } else if (isI18nPayload(responseObj)) {
        // Response object is directly an i18n payload
        message = i18n
          ? this.translate(
              i18n,
              responseObj.key,
              responseObj.args as Record<string, string | number>,
            )
          : responseObj.key;
      } else {
        message = 'An error occurred';
      }
    } else {
      message = 'An error occurred';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }

  private translate(
    i18n: I18nContext,
    key: string,
    args?: Record<string, string | number>,
  ): string {
    try {
      const translated = i18n.t(key, { args }) as string;
      // If translation returns the key itself, it means translation wasn't found
      return translated !== key ? translated : key;
    } catch {
      this.logger.warn(`Translation failed for key: ${key}`);
      return key;
    }
  }
}
