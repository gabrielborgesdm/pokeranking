import mongoose from 'mongoose'
import { type Migration } from '../entities/Migration'
import { MIGRATIONS_TABLE_NAME } from '../entities/Migration'

const MigrationSchema = new mongoose.Schema<Migration>({
  name: { type: String, require: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<Migration>(MIGRATIONS_TABLE_NAME, MigrationSchema)
