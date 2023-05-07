import PokemonRepository from '../../../src/repository/PokemonRepository'
import { makePokemonCreationPayload } from '../../object-mother/PokemonObjectMother'
import { setUpIntegrationTests } from '../../testsSetup'

describe('Pokemon Repository', () => {
  const pokemonRepository = new PokemonRepository()
  setUpIntegrationTests()

  it('should get no pokemon when the database is empty', async () => {
    const sut = await pokemonRepository.getAll()

    expect(sut).toHaveLength(0)
  })

  it('should create a pokemon', async () => {
    const pokemon = makePokemonCreationPayload()

    const sut = await pokemonRepository.create(pokemon)

    expect(sut).not.toBeNull()
    expect(sut?.name).toBe(pokemon.name)
  })

  it('should find a created pokemon', async () => {
    const pokemonPayload = makePokemonCreationPayload()

    const createdPokemon = await pokemonRepository.create(pokemonPayload)
    const sut = await pokemonRepository.findById(createdPokemon?._id as string)

    expect(sut).not.toBeNull()
    expect(pokemonPayload.name).toBe(pokemonPayload.name)
  })

  it('should not find a pokemon', async () => {
    const sut = await pokemonRepository.findById(makePokemonCreationPayload()?._id as string)

    expect(sut).toBeNull()
  })

  it('should find a pokemon by its name', async () => {
    const pokemonPayload = makePokemonCreationPayload()

    const createdPokemon = await pokemonRepository.create(pokemonPayload)
    const sut = await pokemonRepository.findBy({ name: createdPokemon?.name })

    expect(sut).not.toBeNull()
    expect(sut?._id?.toString()).toBe(createdPokemon?._id?.toString())
  })

  it('should not find pokemon by name if it does not exist', async () => {
    const sut = await pokemonRepository.findBy({ name: 'John' })

    expect(sut).toBeNull()
  })

  it('should get all pokemon when 2 were created', async () => {
    const pokemonPayload1 = makePokemonCreationPayload({ name: 'john' })
    const pokemonPayload2 = makePokemonCreationPayload({ name: 'doe' })

    await pokemonRepository.create(pokemonPayload1)
    await pokemonRepository.create(pokemonPayload2)
    const sut = await pokemonRepository.getAll()

    expect(sut).toHaveLength(2)
    expect(sut[0].name).toBe(pokemonPayload1.name)
    expect(sut[1].name).toBe(pokemonPayload2.name)
  })

  it('should delete a pokemon', async () => {
    const pokemonPayload = makePokemonCreationPayload()

    const createdPokemon = await pokemonRepository.create(pokemonPayload)
    const sut = await pokemonRepository.delete(createdPokemon?._id as string)

    expect(sut).not.toBeNull()
    expect(sut?._id?.toString()).toBe(createdPokemon?._id?.toString())
  })

  it('should not find a pokemon to delete', async () => {
    const sut = await pokemonRepository.delete(makePokemonCreationPayload()?._id as string)

    expect(sut).toBeNull()
  })

  it('should update a pokemon', async () => {
    const pokemonPayload = makePokemonCreationPayload({ name: 'John' })
    const newPokemonname = 'Doe'

    const createdPokemon = await pokemonRepository.create(pokemonPayload)
    const sut = await pokemonRepository.update(createdPokemon?._id?.toString() as string, { name: newPokemonname })

    expect(sut).not.toBeNull()
    expect(sut?.name).toBe(newPokemonname)
  })

  it('should not find a pokemon to update', async () => {
    const sut = await pokemonRepository.update(makePokemonCreationPayload()?._id as string, { name: 'Doe' })

    expect(sut).toBeNull()
  })
})
