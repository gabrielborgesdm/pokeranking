import { IPokemon } from '../../../../configs/types/IPokemon'

export const shouldFilterPokemon = (filter: string, pokemon: IPokemon) => {
  return pokemon.name.toLowerCase().includes(filter.toLowerCase())
}
