import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/custom.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new CustomLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startTime = Date.now();

    // Get user ID if authenticated (set by JwtAuthGuard)
    const userId = (request as Request & { user?: { _id?: string } }).user?._id;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} ${response.statusCode} ${duration}ms${userId ? ` - user:${userId}` : ''}`,
          );
        },
        error: (error: { status?: number; message?: string }) => {
          const duration = Date.now() - startTime;
          const status = error.status || 500;
          this.logger.warn(
            `${method} ${url} ${status} ${duration}ms${userId ? ` - user:${userId}` : ''} - ${error.message}`,
          );
        },
      }),
    );
  }
}
