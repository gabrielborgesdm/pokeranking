import { IPokemonDocument } from '../configs/types/IPokemon'
import { IRequest } from '../configs/types/IRequest'
import { IUser } from '../configs/types/IUser'
import { IUserPokemonMutate } from '../configs/types/IUserPokemon'
import { abstractPokemon } from '../pages/api/_app/helpers/PokemonHelpers'

export const populateUserWithPokemons = (
  req: IRequest,
  user: IUser,
  allPokemons: IPokemonDocument[]
) => {
  const userPokemons: IUserPokemonMutate[] = user.pokemons
  user.pokemons = userPokemons.map(userPokemon => {
    const filteredPokemons = allPokemons.filter(
      filteredPokemon => filteredPokemon.id === userPokemon.pokemon
    )
    const populated = { ...abstractPokemon(req, filteredPokemons[0]) }
    if (userPokemon.note) populated.note = userPokemon.note
    return populated
  })
}
