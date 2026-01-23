import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TK } from '../../i18n/constants/translation-keys';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitService } from '../services/rate-limit.service';
import { getClientIp } from '../utils/request.util';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRateLimited = this.reflector.getAllAndOverride<boolean>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isRateLimited) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = getClientIp(request);

    const { success } = await this.rateLimitService.checkAuthLimit(ip);

    if (!success) {
      throw new HttpException(
        { key: TK.COMMON.TOO_MANY_REQUESTS },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
