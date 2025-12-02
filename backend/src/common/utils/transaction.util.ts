import { Connection, ClientSession } from 'mongoose';

export interface SessionOptions {
  session?: ClientSession | null;
}

/**
 * Executes a callback within a MongoDB transaction if replica set is available,
 * otherwise falls back to running without a transaction (for local development).
 */
export async function withTransaction<T>(
  connection: Connection,
  callback: (session: ClientSession | null) => Promise<T>,
): Promise<T> {
  // Check if replica set is configured by attempting to start a session
  try {
    const session = await connection.startSession();
    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await callback(session);
      });
      return result as T;
    } finally {
      await session.endSession();
    }
  } catch (error: unknown) {
    // If transactions aren't supported (no replica set), run without transaction
    if (
      error instanceof Error &&
      (error.message.includes('Transaction numbers') ||
        error.message.includes('not in primary or recovering state') ||
        error.message.includes('replicaSet'))
    ) {
      return callback(null);
    }
    throw error;
  }
}
