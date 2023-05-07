import { closeConnection, connect, dropDatabase } from '../src/config/DatabaseConfig'

export const setUpIntegrationTests = (): void => {
  beforeAll(async () => {
    await connect()
  })

  afterEach(async () => {
    await dropDatabase()
  })

  afterAll(async () => {
    await closeConnection()
  })
}
