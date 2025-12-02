import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { getInMemoryRedis } from '../mocks/in-memory-redis';

let mongoServer: MongoMemoryReplSet | null = null;

/**
 * Starts an in-memory MongoDB replica set for testing (supports transactions)
 * @returns The connection URI for the test database
 */
export async function startTestDatabase(): Promise<string> {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: 'wiredTiger',
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
    // Suppress ECONNRESET errors during teardown (common on Windows)
    // The MongoDB driver logs these errors when the server stops while connections are closing
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    const filterOutput = (
      chunk: string | Uint8Array,
      encoding?: BufferEncoding | ((err?: Error) => void),
      callback?: (err?: Error) => void,
    ): boolean => {
      const text = chunk.toString();
      if (
        text.includes('ECONNRESET') ||
        text.includes('MongoNetworkError') ||
        text.includes('read ECONNRESET')
      ) {
        if (typeof callback === 'function') callback();
        return true;
      }
      if (typeof encoding === 'function') {
        return originalStderrWrite(chunk, encoding);
      }
      return originalStderrWrite(chunk, encoding, callback);
    };

    process.stderr.write = filterOutput as typeof process.stderr.write;

    // Close all mongoose connections first
    const connections = mongoose.connections;
    for (const connection of connections) {
      if (connection.readyState !== 0) {
        try {
          await connection.close();
        } catch {
          // Ignore errors during cleanup
        }
      }
    }

    // Disconnect mongoose default connection
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore errors during cleanup
    }

    // Stop the server with force option to avoid hanging
    await mongoServer.stop({ doCleanup: true, force: true });
    mongoServer = null;

    // Restore stderr after a brief delay to catch any async errors
    setTimeout(() => {
      process.stderr.write = originalStderrWrite;
    }, 500);
  }
}

/**
 * Clears all collections in the test database and the in-memory Redis cache
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

  // Clear in-memory Redis cache to ensure test isolation
  getInMemoryRedis().clearAll();
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
