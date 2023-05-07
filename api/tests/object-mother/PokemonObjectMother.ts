import { PokemonSchema, type Pokemon } from '../../src/model/domain/PokemonDomain'
import { PokemonRequestDTOSchema } from '../../src/model/dto/PokemonDTO'

export const makePokemon = (payload: Partial<Pokemon> = {}): Pokemon => {
  const defaultPokemon = {
    _id: '41224d776a326fb40f000001',
    name: 'Mr. Mime',
    image: 'mr-mime.png'
  }

  return { ...defaultPokemon, ...payload }
}

export const makePokemonCreationPayload = (payload: Partial<Pokemon> = {}): Pokemon => {
  const parsedPokemon = PokemonRequestDTOSchema.parse(makePokemon(payload))

  return PokemonSchema.parse(parsedPokemon)
}
