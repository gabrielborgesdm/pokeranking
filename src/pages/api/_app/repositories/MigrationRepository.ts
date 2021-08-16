import { IMigration } from '../../../../configs/types/IMigration'
import Migration from '../models/MigrationModel'

export default class MigrationRepository {
  async getExecutedMigrations (): Promise<Array<string>> {
    let migrations = []
    try {
      const response: Array<IMigration> = await Migration.find({ executed: true }).exec()
      if (response && response.length) {
        migrations = response.map((migration: IMigration) => migration.name)
      }
    } catch (error) {
      console.log(error)
    }
    return migrations
  }

  async saveExecutedMigration (migrationInfo: IMigration): Promise<IMigration> {
    let migration: IMigration = null
    try {
      migration = await Migration.create(migrationInfo)
    } catch (error) {
      console.log(error)
    }
    return migration
  }
}
