import type Migration from '../model/entities/Migration'
import MigrationSchema from '../model/database/MigrationSchema'

export default class MigrationRepository {
  async getAllMigrations (): Promise<string[]> {
    let migrations: string[] = []

    const response: Migration[] = await MigrationSchema.find().exec()

    if (response?.length > 0) {
      migrations = response.map((migration: Migration) => migration.name)
    }

    return migrations
  }

  async createMigration (payload: Migration): Promise<Migration | null> {
    let migration: Migration | null = null

    migration = await MigrationSchema.create(payload)

    return migration
  }
}
