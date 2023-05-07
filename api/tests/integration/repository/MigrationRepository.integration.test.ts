import MigrationRepository from '../../../src/repository/MigrationRepository'
import { makeMigration } from '../../object-mother/Migration'
import { setUpIntegrationTests } from '../../testsSetup'

describe('Migration Repository', () => {
  const migrationRepository = new MigrationRepository()
  setUpIntegrationTests()

  it('should create migration', async () => {
    const migration = makeMigration()

    const response = await migrationRepository.createMigration(migration)

    expect(response).not.toBeNull()
    expect(response?.name).toBe(migration.name)
  })

  it('should get a created migration', async () => {
    const migration = makeMigration()
    await migrationRepository.createMigration(migration)

    const response = await migrationRepository.getAllMigrations()

    expect(response).toHaveLength(1)
    expect(response[0]).toBe(migration.name)
  })
})
