import { IPokemon, IPokemonDocument } from '../../../../configs/types/IPokemon'

export const shouldFilterPokemon = (filter: string, pokemon: IPokemon) => {
  return pokemon.name.toLowerCase().includes(filter.toLowerCase())
}

export const abstractPokemon = (pokemon: IPokemonDocument): IPokemon => {
  const { id, name, image } = pokemon
  return { id, name, image }
}
