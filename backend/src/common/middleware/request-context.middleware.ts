import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  RequestContextService,
  RequestContextData,
} from '../services/request-context.service';

interface RequestWithUser extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    const context: RequestContextData = {
      path: req.path,
      method: req.method,
      requestId: req.headers['x-request-id'] as string | undefined,
    };

    // User will be set later by the auth guard after JWT validation
    // We need to run the rest of the request within this context
    RequestContextService.run(context, () => {
      next();
    });
  }
}
