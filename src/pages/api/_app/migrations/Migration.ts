import MigrationRepository from '../repositories/MigrationRepository'
import { addAdminUser } from './AddAdminUser'
import { addPokemons } from './AddPokemons'

const migrations = {
  addAdminUser: addAdminUser,
  addPokemons: addPokemons
}

let isExecutingMigration = false

class Migration {
  isMigrated: boolean = false;
  executeMigrations = async () => {
    if (isExecutingMigration) return
    isExecutingMigration = true
    const migration = new MigrationRepository()
    try {
      const executedMigrations: Array<string> =
        await migration.getExecutedMigrations()
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
    } catch (error) {
      console.log(error)
      this.isMigrated = false
    } finally {
      isExecutingMigration = false
    }
  };
}

export default Migration
