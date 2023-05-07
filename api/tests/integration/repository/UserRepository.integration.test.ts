import UserRepository from '../../../src/repository/UserRepository'
import { makeUserCreationPayload } from '../../object-mother/UserObjectMother'
import { setUpIntegrationTests } from '../../testsSetup'

describe('User Repository', () => {
  const userRepository = new UserRepository()
  setUpIntegrationTests()

  it('should get no user when the database is empty', async () => {
    const sut = await userRepository.getAll()

    expect(sut).toHaveLength(0)
  })

  it('should create a user', async () => {
    const user = makeUserCreationPayload()

    const sut = await userRepository.create(user)

    expect(sut).not.toBeNull()
    expect(sut?.username).toBe(user.username)
  })

  it('should get a created user', async () => {
    const userPayload = makeUserCreationPayload()

    const createdUser = await userRepository.create(userPayload)
    const sut = await userRepository.findById(createdUser?._id as string)

    expect(sut).not.toBeNull()
    expect(userPayload.username).toBe(userPayload.username)
  })

  it('should get all users when 2 were created', async () => {
    const userPayload1 = makeUserCreationPayload({ username: 'john' })
    const userPayload2 = makeUserCreationPayload({ username: 'doe' })

    await userRepository.create(userPayload1)
    await userRepository.create(userPayload2)
    const sut = await userRepository.getAll()

    expect(sut).toHaveLength(2)
    expect(sut[0].username).toBe(userPayload1.username)
    expect(sut[1].username).toBe(userPayload2.username)
  })

  it('should delete a user', async () => {
    const userPayload = makeUserCreationPayload()

    const createdUser = await userRepository.create(userPayload)
    const sut = await userRepository.delete(createdUser?._id as string)

    expect(sut).not.toBeNull()
    expect(sut?._id?.toString()).toBe(createdUser?._id?.toString())
  })
})
