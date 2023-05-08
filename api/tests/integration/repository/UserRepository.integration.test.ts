import { type Pokemon } from '../../../src/model/domain/PokemonDomain'
import PokemonRepository from '../../../src/repository/PokemonRepository'
import UserRepository from '../../../src/repository/UserRepository'
import { makePokemonCreationPayload } from '../../object-mother/PokemonObjectMother'
import { makeUser, makeUserCreationPayload } from '../../object-mother/UserObjectMother'
import { setUpIntegrationTests } from '../../testsSetup'

describe('User Repository', () => {
  const userRepository = new UserRepository()
  const pokemonRepository = new PokemonRepository()
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

  it('should find a created user', async () => {
    const userPayload = makeUserCreationPayload()

    const createdUser = await userRepository.create(userPayload)
    const sut = await userRepository.findById(createdUser?._id as string)

    expect(sut).not.toBeNull()
    expect(userPayload.username).toBe(userPayload.username)
  })

  it('should not find a user', async () => {
    const sut = await userRepository.findById(makeUser()._id as string)

    expect(sut).toBeNull()
  })

  it('should find a user by its username', async () => {
    const userPayload = makeUserCreationPayload()

    const createdUser = await userRepository.create(userPayload)
    const sut = await userRepository.findBy({ username: createdUser?.username })

    expect(sut).not.toBeNull()
    expect(sut?._id?.toString()).toBe(createdUser?._id?.toString())
  })

  it('should not find by username if it does not exist', async () => {
    const sut = await userRepository.findBy({ username: 'John' })

    expect(sut).toBeNull()
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

  it('should not find a user to delete', async () => {
    const sut = await userRepository.delete(makeUser()?._id as string)

    expect(sut).toBeNull()
  })

  it('should update a user', async () => {
    const userPayload = makeUserCreationPayload({ username: 'John' })
    const newUsername = 'Doe'

    const createdUser = await userRepository.create(userPayload)
    const sut = await userRepository.update(createdUser?._id?.toString() as string, { username: newUsername })

    expect(sut).not.toBeNull()
    expect(sut?.username).toBe(newUsername)
  })

  it('should not find a user to update', async () => {
    const sut = await userRepository.update(makeUser()?._id as string, { username: 'Doe' })

    expect(sut).toBeNull()
  })

  it('should populate users with pokemon', async () => {
    const pokemonPayload = makePokemonCreationPayload()
    const createdPokemon = await pokemonRepository.create(pokemonPayload)
    const userPayload = makeUserCreationPayload({
      userPokemon: [
        { pokemon: createdPokemon?._id?.toString() as string, note: 'A pokemon' }
      ]
    })

    await userRepository.create(userPayload)
    const sut = await userRepository.getAll()

    if (sut[0] === undefined || sut[0].userPokemon === undefined || userPayload?.userPokemon === undefined) {
      throw new Error('Object is undefined')
    }

    const populatedPokemon = sut[0].userPokemon[0].pokemon as Pokemon
    expect(sut[0].userPokemon[0].note).toBe(userPayload?.userPokemon[0].note)
    expect(populatedPokemon.name).toBe(pokemonPayload.name)
  })
})
