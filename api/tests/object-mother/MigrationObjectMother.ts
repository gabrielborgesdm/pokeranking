import { type Migration } from '../../src/model/domain/MigrationDomain'

export const makeMigration = (): Migration => ({
  name: 'test-migration'
})
