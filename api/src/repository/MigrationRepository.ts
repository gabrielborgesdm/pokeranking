import { type Migration } from '../model/domain/MigrationDomain'
import MigrationEntity from '../model/entity/MigrationEntity'

export default class MigrationRepository {
  async getAllMigrations (): Promise<string[]> {
    let migrations: string[] = []

    const response: Migration[] = await MigrationEntity.find().exec()
    if (response?.length > 0) {
      migrations = response.map((migration: Migration) => migration.name)
    }

    return migrations
  }

  async create (payload: Migration): Promise<Migration | null> {
    let migration: Migration | null = null

    migration = await MigrationEntity.create(payload)

    return migration
  }
}
