import { IPokemon, IPokemonMutate, IPokemonType } from '../../../../configs/types/IPokemon'
import pokemons from '../../../../assets/pokemons.json'
import { formatPokemons, shouldFilterPokemon } from '../helpers/PokemonHelpers'

const formattedPokemons = formatPokemons(pokemons)

export default class PokemonRepository {
  getMany = (filter: string = null) : Array<IPokemonType> => {
    return filter ? formattedPokemons.filter((pokemon) => shouldFilterPokemon(filter, pokemon)) : formattedPokemons
  }

  getById = (id: number) : IPokemonType | null => {
    const pokemons = formattedPokemons.filter((pokemon) => pokemon.id === id)
    return pokemons.length ? pokemons[0] : null
  }

  getAvatarImage = (avatarId: number): string => {
    return this.getById(avatarId).image
  }

  populatePokemons = (pokemonMutateArray: Array<IPokemonMutate>) : Array<IPokemon> => {
    const populatedPokemons = []
    pokemonMutateArray.forEach((pokemonMutateObject: IPokemonMutate) => {
      const pokemon = this.getById(pokemonMutateObject.pokemon)
      if (pokemon) {
        populatedPokemons.push({ ...pokemon, note: pokemonMutateObject.note })
      }
    })
    return populatedPokemons
  }
}
