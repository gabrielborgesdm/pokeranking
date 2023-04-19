import mongoose from 'mongoose'

export async function connect (): Promise<void> {
  const databaseConnectionURL = process.env.DATABASE_CONNECTION_URL as string
  if (databaseConnectionURL === undefined) {
    throw new Error('DATABASE_CONNECTION_URL environment variable is missing')
  }

  await mongoose.connect(databaseConnectionURL)
}
