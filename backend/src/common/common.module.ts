import { Module, Global } from '@nestjs/common';
import { RateLimitService } from './services/rate-limit.service';

@Global()
@Module({
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class CommonModule {}
