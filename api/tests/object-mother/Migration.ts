import { type Migration } from '../../src/model/entities/Migration'

export const makeMigration = (): Migration => ({
  name: 'test-migration'
})
