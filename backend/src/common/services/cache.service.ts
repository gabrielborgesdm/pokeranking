import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheService {
  private readonly redis: Redis | null;
  private readonly logger = new Logger(CacheService.name);
  private readonly disabled: boolean;

  constructor(private configService: ConfigService) {
    this.disabled = this.configService.get<boolean>('CACHE_DISABLED', false);
    console.log('isDisabled', this.disabled);

    if (this.isEnabled()) {
      const url = this.configService.get<string>('UPSTASH_REDIS_URL');
      const token = this.configService.get<string>('UPSTASH_REDIS_TOKEN');

      if (!url || !token) {
        this.logger.warn(
          'CACHE_ENABLED is true but UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN is missing. Cache disabled.',
        );
        this.disabled = true;
        this.redis = null;
      } else {
        this.redis = new Redis({ url, token });
        this.logger.log('Cache service initialized with Redis');
      }
    } else {
      this.redis = null;
      this.logger.log('Cache service disabled');
    }
  }

  isEnabled(): boolean {
    return this.disabled === false;
  }

  /**
   * Exposes the Redis client for services that need direct access (e.g., RateLimitService)
   */
  getRedisClient(): Redis | null {
    return this.redis;
  }

  /**
   * Retrieves a cached value by key
   * @returns The cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      this.logger.warn('Cache is disabled');
      console.log(this.redis);
      return null;
    }
    console.log(this.redis);
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
    if (!this.redis) {
      return;
    }
    console.log(this.redis);
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
    if (!this.redis) {
      return;
    }
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key "${key}":`, error);
    }
  }
}
