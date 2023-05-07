import UserRepository from '../../../src/repository/UserRepository'
import { makeUserCreationPayload } from '../../object-mother/UserObjectMother'
import { setUpIntegrationTests } from '../../testsSetup'

describe('User Repository', () => {
  const userRepository = new UserRepository()
  setUpIntegrationTests()

  it('should get no user when the database is empty', async () => {
    const response = await userRepository.getAll()

    expect(response).toHaveLength(0)
  })

  it('should create a user', async () => {
    const user = makeUserCreationPayload()
    console.log(user)
    const response = await userRepository.create(user)

    expect(response).not.toBe(null)
    expect(response?.username).toBe(user.username)
  })
})
