import { Connection, ClientSession } from 'mongoose';

export interface SessionOptions {
  session?: ClientSession | null;
}

export async function withTransaction<T>(
  connection: Connection,
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
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
}
