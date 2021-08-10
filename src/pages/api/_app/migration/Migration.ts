import MigrationRepository from '../repository/MigrationRepository'
import { addAdminUser } from './AddAdminUser'

const migrations = {
  addAdminUser: addAdminUser
}

class Migration {
  isMigrated: boolean = false
  executeMigrations = async () => {
    const migration = new MigrationRepository()
    const executedMigrations: Array<string> = await migration.getExecutedMigrations()
    for (const [migrationName, runMigration] of Object.entries(migrations)) {
      if (executedMigrations.includes(migrationName)) continue
      await runMigration()
      migration.saveExecutedMigration({
        name: migrationName,
        executed: true
      })
      console.log(`Migration executed:${migrationName}`)
    }
    this.isMigrated = true
  }
}

export default Migration