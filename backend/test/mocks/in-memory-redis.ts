/**
 * In-memory Redis mock using Node.js globals for testing
 * Implements the subset of @upstash/redis interface needed by RateLimitService
 */

// Global store for in-memory Redis data
const globalStore = global as typeof globalThis & {
  __TEST_REDIS_STORE__?: Map<string, { value: string; expiresAt?: number }>;
};

if (!globalStore.__TEST_REDIS_STORE__) {
  globalStore.__TEST_REDIS_STORE__ = new Map();
}

export class InMemoryRedis {
  private store = globalStore.__TEST_REDIS_STORE__!;

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(
    key: string,
    value: string,
    options?: { ex?: number; px?: number; exat?: number; pxat?: number },
  ): Promise<'OK'> {
    let expiresAt: number | undefined;

    if (options?.ex) {
      expiresAt = Date.now() + options.ex * 1000;
    } else if (options?.px) {
      expiresAt = Date.now() + options.px;
    } else if (options?.exat) {
      expiresAt = options.exat * 1000;
    } else if (options?.pxat) {
      expiresAt = options.pxat;
    }

    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    return deleted ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const item = this.store.get(key);
    const currentValue = item ? parseInt(item.value, 10) : 0;
    const newValue = currentValue + 1;
    this.store.set(key, { value: String(newValue), expiresAt: item?.expiresAt });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;

    item.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiresAt) return -1;

    const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  /**
   * Execute Lua script with SHA hash
   * For rate limiting, @upstash/ratelimit expects:
   * - [1] for allowed (success)
   * - [0] for rate limited (blocked)
   * We always allow requests in tests
   */
  async evalsha(_sha: string, _keys: string[], _args: string[]): Promise<any> {
    // Return 1 to indicate success (allowed)
    return 1;
  }

  /**
   * Execute Lua script directly
   * For rate limiting, we'll just always allow requests through in tests
   */
  async eval(_script: string, _keys: string[], _args: string[]): Promise<any> {
    // Return 1 to indicate success (allowed)
    return 1;
  }

  /**
   * SCRIPT LOAD command - returns fake SHA
   */
  async scriptLoad(_script: string): Promise<string> {
    return 'fake-sha-hash';
  }

  /**
   * Clear all data from the in-memory store
   * Useful for cleaning up between tests
   */
  clearAll(): void {
    this.store.clear();
  }
}

/**
 * Get or create the global in-memory Redis instance
 */
export function getInMemoryRedis(): InMemoryRedis {
  const globalRedis = global as typeof globalThis & {
    __TEST_REDIS_INSTANCE__?: InMemoryRedis;
  };

  if (!globalRedis.__TEST_REDIS_INSTANCE__) {
    globalRedis.__TEST_REDIS_INSTANCE__ = new InMemoryRedis();
  }

  return globalRedis.__TEST_REDIS_INSTANCE__;
}
