import { IPokemon, IUserPokemon, IUserPokemonMutate } from '../../../../config/type/IPokemon'
import pokemons from '../../../../assets/pokemons.json'
import { formatPokemons, shouldFilterPokemon } from '../helper/PokemonHelpers'

const formattedPokemons = formatPokemons(pokemons)

export default class PokemonRepository {
  getMany = (filter: string = null) : Array<IPokemon> => {
    return filter ? formattedPokemons.filter((pokemon) => shouldFilterPokemon(filter, pokemon)) : formattedPokemons
  }

  getById = (id: number) : IPokemon | null => {
    const pokemons = formattedPokemons.filter((pokemon) => pokemon.id === id)
    return pokemons.length ? pokemons[0] : null
  }

  populatePokemons = (pokemonMutateArray: Array<IUserPokemonMutate>) : Array<IUserPokemon> => {
    const populatedPokemons = []
    pokemonMutateArray.forEach((pokemonMutateObject: IUserPokemonMutate) => {
      const pokemon = this.getById(pokemonMutateObject.pokemon)
      if (pokemon) {
        populatedPokemons.push({ ...pokemon, note: pokemonMutateObject.note })
      }
    })
    return populatedPokemons
  }
}
