import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      url: this.configService.getOrThrow<string>('UPSTASH_REDIS_URL'),
      token: this.configService.getOrThrow<string>('UPSTASH_REDIS_TOKEN'),
    });
  }

  /**
   * Exposes the Redis client for services that need direct access (e.g., RateLimitService)
   */
  getRedisClient(): Redis {
    return this.redis;
  }

  /**
   * Retrieves a cached value by key
   * @returns The cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get<T>(key);
      if (value === null) {
        this.logger.debug(`Cache miss: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Stores a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache (will be JSON serialized)
   * @param ttlSeconds Time-to-live in seconds. If omitted, cache persists until explicitly deleted.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const options = ttlSeconds ? { ex: ttlSeconds } : undefined;
      await this.redis.set(key, value, options);
    } catch (error) {
      this.logger.error(`Cache set error for key "${key}":`, error);
    }
  }

  /**
   * Deletes a cached value by key
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key "${key}":`, error);
    }
  }
}
