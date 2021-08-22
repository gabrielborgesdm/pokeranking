import { IPokemonType } from '../../../../configs/types/IPokemon'

export const shouldFilterPokemon = (filter: string, pokemon: IPokemonType) => {
  return pokemon.name.toLowerCase().includes(filter.toLowerCase())
}

export const formatPokemons = (pokemons: Array<IPokemonType>) => {
  return pokemons.map((pokemon) => {
    pokemon.image = `/pokemons/${pokemon.image}`
    return pokemon
  })
}
