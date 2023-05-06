import MigrationRepository from '../../../src/repository/MigrationRepository'
import { closeConnection, connect, dropDatabase } from '../../../src/config/DatabaseConfig'
import { makeMigration } from '../../object-mother/Migration'

beforeAll(async () => {
  await connect()
})

afterEach(async () => {
  await dropDatabase()
})

afterAll(async () => {
  await closeConnection()
})

const migrationRepository = new MigrationRepository()

test('should create migration', async () => {
  const migration = makeMigration()

  const response = await migrationRepository.createMigration(migration)

  expect(response).not.toBeNull()
  expect(response?.name).toBe(migration.name)
})

test('should get a created migration', async () => {
  const migration = makeMigration()
  await migrationRepository.createMigration(migration)

  const response = await migrationRepository.getAllMigrations()

  expect(response).toHaveLength(1)
  expect(response[0]).toBe(migration.name)
})
