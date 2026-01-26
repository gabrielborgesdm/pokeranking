import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { RateLimitService } from './services/rate-limit.service';
import { RequestContextService } from './services/request-context.service';
import { RequestContextMiddleware } from './middleware/request-context.middleware';

@Global()
@Module({
  providers: [CacheService, RateLimitService, RequestContextService],
  exports: [CacheService, RateLimitService, RequestContextService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
