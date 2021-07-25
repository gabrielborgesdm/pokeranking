import { IPokemon } from '../config/type/IPokemon'
import pokemons from '../../../../assets/pokemon.json/pokemons.json'
import { shouldFilterPokemon } from '../helper/PokemonHelpers'

export default class PokemonRepository {
  getMany = (filter: string = null) : Array<IPokemon> => {
    if (!filter) return pokemons
    const filteredPokemon: Array<IPokemon> = pokemons.filter((pokemon) => shouldFilterPokemon(filter, pokemon))
    return filteredPokemon
  }
}
