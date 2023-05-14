import mongoose from 'mongoose'
import { getEnvVariable } from '../helper/EnvHelper'

function getDatabaseConnectionURL (): string {
  const databaseConnectionURL =
    getEnvVariable('ENVIRONMENT', 'develop') === 'test'
      ? getEnvVariable('TEST_DATABASE_CONNECTION_URL')
      : getEnvVariable('DATABASE_CONNECTION_URL')

  return databaseConnectionURL
}

export async function connect (): Promise<void> {
  await mongoose.connect(getDatabaseConnectionURL())
}

export async function dropDatabase (): Promise<void> {
  await mongoose.connection.db.dropDatabase()
}

export async function closeConnection (): Promise<void> {
  await mongoose.connection.close()
}
