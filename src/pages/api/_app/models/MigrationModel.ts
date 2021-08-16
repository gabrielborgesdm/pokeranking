import mongoose from '../../../../configs/DatabaseConfig'
import { IMigration } from '../../../../configs/types/IMigration'

const MigrationModel = new mongoose.Schema<IMigration>({
  name: { type: String, require: true },
  executed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Migration = mongoose.models.Migrations || mongoose.model<IMigration>('Migrations', MigrationModel)
export default Migration
