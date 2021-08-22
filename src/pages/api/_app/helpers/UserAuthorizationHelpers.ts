import { USER_KEYS, USER_ROLES } from '../../../../configs/APIConfig'
import { IPokemonMutate } from '../../../../configs/types/IPokemon'
import { IUserDocument, IUserResponse } from '../../../../configs/types/IUser'
import PokemonRepository from '../repositories/PokemonRepository'

const pokemonRepository = new PokemonRepository()

export const isUserAuthorized = (authenticatedUser: IUserResponse, targetUser: IUserDocument): boolean => {
  return authenticatedUser.role === USER_ROLES.ADMIN || authenticatedUser._id.toString() === targetUser._id.toString()
}
const populateUserWithPokemons = (user: IUserResponse, pokemons: Array<IPokemonMutate>) => {
  user.pokemons = pokemonRepository.populatePokemons(pokemons)
}
const deleteFromUser = (user: IUserResponse, ...fields: Array<string>) => {
  fields.forEach((field: string) => delete user[field])
}
export const formatUserDocument = (response: IUserDocument): IUserResponse => {
  const user = response.toObject()
  deleteFromUser(user, USER_KEYS.PASSWORD, USER_KEYS.__V)
  populateUserWithPokemons(user, response.pokemons)
  user.avatar = pokemonRepository.getAvatarImage(user.avatar)
  return user
}

export const abstractUserBasedOnAuthorizationLevel = (authenticatedUser: IUserResponse, response: IUserDocument): IUserResponse => {
  const user: IUserResponse = formatUserDocument(response)
  const { _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT } = USER_KEYS
  if (authenticatedUser.role !== USER_ROLES.ADMIN && authenticatedUser._id.toString() !== response._id.toString()) {
    deleteFromUser(user, _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT)
  }
  return user
}
