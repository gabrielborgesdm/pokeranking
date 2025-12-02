import { Module, Global } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { RateLimitService } from './services/rate-limit.service';

@Global()
@Module({
  providers: [CacheService, RateLimitService],
  exports: [CacheService, RateLimitService],
})
export class CommonModule {}
