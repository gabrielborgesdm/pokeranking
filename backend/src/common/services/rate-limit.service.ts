import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ratelimit } from '@upstash/ratelimit';
import { CacheService } from './cache.service';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private verifyEmailRateLimit: Ratelimit;
  private resendVerificationRateLimit: Ratelimit;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    const redis = this.cacheService.getRedisClient();

    const verifyLimit = this.configService.get<number>(
      'RATE_LIMIT_VERIFY_EMAIL',
      10,
    );
    const resendLimit = this.configService.get<number>(
      'RATE_LIMIT_RESEND_EMAIL',
      2,
    );
    const windowSeconds = this.configService.get<number>(
      'RATE_LIMIT_WINDOW_SECONDS',
      60,
    );

    this.verifyEmailRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(verifyLimit, `${windowSeconds} s`),
      prefix: 'ratelimit:verify-email',
    });

    this.resendVerificationRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(resendLimit, `${windowSeconds} s`),
      prefix: 'ratelimit:resend-verification',
    });
  }

  async checkVerifyEmailLimit(identifier: string) {
    const result = await this.verifyEmailRateLimit.limit(identifier);
    if (!result.success) {
      this.logger.warn(`Rate limit exceeded: verify-email for ${identifier}`);
    }
    return result;
  }

  async checkResendLimit(identifier: string) {
    const result = await this.resendVerificationRateLimit.limit(identifier);
    if (!result.success) {
      this.logger.warn(
        `Rate limit exceeded: resend-verification for ${identifier}`,
      );
    }
    return result;
  }
}
