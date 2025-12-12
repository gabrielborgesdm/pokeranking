import { startTestDatabase } from './utils/test-db.util';

export default async function globalSetup() {
  console.log('\nStarting test database...');

  const uri = await startTestDatabase();
  process.env.MONGODB_TEST_URI = uri;

  // Set test-specific environment variables
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRATION = '1h';
  process.env.NODE_ENV = 'test';

  // Enable cache with mock Upstash credentials for in-memory Redis
  process.env.CACHE_ENABLED = 'true';
  process.env.UPSTASH_REDIS_URL = 'http://localhost:6379';
  process.env.UPSTASH_REDIS_TOKEN = 'test-token';

  console.log('Test database started successfully\n');
}
