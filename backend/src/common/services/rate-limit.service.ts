import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

@Injectable()
export class RateLimitService {
  private verifyEmailRateLimit: Ratelimit;
  private resendVerificationRateLimit: Ratelimit;

  constructor(private configService: ConfigService) {
    const redis = new Redis({
      url: this.configService.getOrThrow<string>('UPSTASH_REDIS_URL'),
      token: this.configService.getOrThrow<string>('UPSTASH_REDIS_TOKEN'),
    });

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
    return await this.verifyEmailRateLimit.limit(identifier);
  }

  async checkResendLimit(identifier: string) {
    return await this.resendVerificationRateLimit.limit(identifier);
  }
}
