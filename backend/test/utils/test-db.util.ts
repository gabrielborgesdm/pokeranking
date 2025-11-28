import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Starts an in-memory MongoDB server for testing
 * @returns The connection URI for the test database
 */
export async function startTestDatabase(): Promise<string> {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'pokeranking-test',
    },
  });

  const uri = mongoServer.getUri();
  return uri;
}

/**
 * Stops the in-memory MongoDB server and disconnects mongoose
 */
export async function stopTestDatabase(): Promise<void> {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
    mongoServer = null;
  }
}

/**
 * Clears all collections in the test database
 * Call this before each test to ensure isolation
 * @param app - NestJS application instance
 */
export async function clearDatabase(app: INestApplication): Promise<void> {
  const connection: Connection = app.get(getConnectionToken());

  if (!connection.db) {
    return;
  }

  const collections = connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Returns database configuration for MongooseModule
 */
export function getTestDatabaseConfig() {
  return {
    uri: process.env.MONGODB_TEST_URI,
    retryAttempts: 3,
    retryDelay: 500,
  };
}
