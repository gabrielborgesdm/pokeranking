import { IPokemon } from '../../../../config/type/IPokemon'

export const shouldFilterPokemon = (filter: string, pokemon: IPokemon) => {
  return pokemon.name.toLowerCase().includes(filter.toLowerCase())
}

export const formatPokemons = (pokemons: Array<IPokemon>) => {
  return pokemons.map((pokemon) => {
    pokemon.image = `/pokemons/${pokemon.image}`
    return pokemon
  })
}
