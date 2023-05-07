import MigrationRepository from '../../../src/repository/MigrationRepository'
import { makeMigration } from '../../object-mother/MigrationObjectMother'
import { setUpIntegrationTests } from '../../testsSetup'

describe('Migration Repository', () => {
  const migrationRepository = new MigrationRepository()
  setUpIntegrationTests()

  it('should create migration', async () => {
    const migration = makeMigration()

    const sut = await migrationRepository.create(migration)

    expect(sut).not.toBeNull()
    expect(sut?.name).toBe(migration.name)
  })

  it('should get no migration when the database is empty', async () => {
    const sut = await migrationRepository.getAllMigrations()

    expect(sut).toHaveLength(0)
  })

  it('should get a created migration', async () => {
    const migration = makeMigration()

    await migrationRepository.create(migration)
    const sut = await migrationRepository.getAllMigrations()

    expect(sut).toHaveLength(1)
    expect(sut[0]).toBe(migration.name)
  })
})
