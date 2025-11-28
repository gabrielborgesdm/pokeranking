import { stopTestDatabase } from './utils/test-db.util';

export default async function globalTeardown() {
  console.log('\nStopping test database...');
  await stopTestDatabase();
  console.log('Test database stopped successfully\n');
}
