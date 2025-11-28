import { startTestDatabase } from './utils/test-db.util';

export default async function globalSetup() {
  console.log('\nStarting test database...');

  const uri = await startTestDatabase();
  process.env.MONGODB_TEST_URI = uri;

  // Set test-specific environment variables
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRATION = '1h';
  process.env.NODE_ENV = 'test';

  console.log('Test database started successfully\n');
}
