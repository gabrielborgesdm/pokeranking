import { type Pokemon } from '../model/domain/PokemonDomain'
import { type PokemonRequestDTO } from '../model/dto/PokemonDTO'
import InternalServerError from '../model/exception/InternalServerError'
import NotFoundException from '../model/exception/NotFoundExceptions'
import PokemonRepository from '../repository/PokemonRepository'

export class PokemonService {
  pokemonRepository = new PokemonRepository()

  async getAllPokemons (): Promise<Pokemon[]> {
    return await this.pokemonRepository.getAll()
  }

  async getPokemon (pokemonId: string): Promise<Pokemon | null> {
    const pokemon = await this.pokemonRepository.findById(pokemonId)

    if (pokemon == null) {
      throw new NotFoundException('Pokemon not found')
    }

    return pokemon
  }

  async createPokemon (pokemonPayload: PokemonRequestDTO): Promise<Pokemon | null> {
    const pokemon = await this.pokemonRepository.create(pokemonPayload)

    if (pokemon == null) {
      throw new InternalServerError('Could not create Pokemon')
    }

    return pokemon
  }
}
