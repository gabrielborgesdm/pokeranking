import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ratelimit } from '@upstash/ratelimit';
import { CacheService } from './cache.service';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private verifyEmailRateLimit: Ratelimit | null = null;
  private resendVerificationRateLimit: Ratelimit | null = null;
  private authRateLimit: Ratelimit | null = null;
  private readonly enabled: boolean;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    const redis = this.cacheService.getRedisClient();

    if (!redis) {
      this.enabled = false;
      this.logger.log('Rate limiting disabled (cache not available)');
      return;
    }

    this.enabled = true;

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

    this.authRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'ratelimit:auth',
    });
  }

  async checkVerifyEmailLimit(identifier: string) {
    if (!this.enabled || !this.verifyEmailRateLimit) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
    const result = await this.verifyEmailRateLimit.limit(identifier);
    if (!result.success) {
      this.logger.warn(`Rate limit exceeded: verify-email for ${identifier}`);
    }
    return result;
  }

  async checkResendLimit(identifier: string) {
    if (!this.enabled || !this.resendVerificationRateLimit) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
    const result = await this.resendVerificationRateLimit.limit(identifier);
    if (!result.success) {
      this.logger.warn(
        `Rate limit exceeded: resend-verification for ${identifier}`,
      );
    }
    return result;
  }

  async checkAuthLimit(identifier: string) {
    if (!this.enabled || !this.authRateLimit) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
    try {
      const result = await this.authRateLimit.limit(identifier);
      if (!result.success) {
        this.logger.warn(`Rate limit exceeded: auth for ${identifier}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Rate limit check failed: ${error}`);
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
  }
}
