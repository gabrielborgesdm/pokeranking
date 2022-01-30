import { IPokemon, IPokemonDocument } from '../../../../configs/types/IPokemon'
import { IRequest } from '../../../../configs/types/IRequest'

export const shouldFilterPokemon = (filter: string, pokemon: IPokemon) => {
  return pokemon.name.toLowerCase().includes(filter.toLowerCase())
}

export const abstractPokemon = (
  req: IRequest,
  pokemon: IPokemonDocument
): IPokemon => {
  const { id, name, image } = pokemon
  return { id, name, image }
}
