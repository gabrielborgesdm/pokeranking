import mongoose from 'mongoose'
import { type Migration } from '../domain/MigrationDomain'
import { MIGRATIONS_TABLE_NAME } from '../domain/MigrationDomain'

const MigrationEntity = new mongoose.Schema<Migration>({
  name: { type: String, require: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<Migration>(MIGRATIONS_TABLE_NAME, MigrationEntity)
