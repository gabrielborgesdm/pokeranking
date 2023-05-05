import * as dotenv from 'dotenv'
import mongoose from 'mongoose'

function getDatabaseConnectionURL (): string {
  const { ENVIRONMENT, DATABASE_CONNECTION_URL, TEST_DATABASE_CONNECTION_URL } = process.env

  const databaseConnectionURL = ENVIRONMENT === 'test' ? TEST_DATABASE_CONNECTION_URL : DATABASE_CONNECTION_URL

  if (databaseConnectionURL === undefined) {
    throw new Error('DATABASE_CONNECTION_URL environment variable is missing')
  }

  return databaseConnectionURL
}

export async function connect (): Promise<void> {
  dotenv.config()
  await mongoose.connect(getDatabaseConnectionURL())
}

export async function dropDatabase (): Promise<void> {
  await mongoose.connection.db.dropDatabase()
}

export async function closeConnection (): Promise<void> {
  await mongoose.connection.close()
}
