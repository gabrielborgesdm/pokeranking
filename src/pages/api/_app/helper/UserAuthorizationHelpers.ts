import { USER_KEYS, USER_ROLES } from '../config/APIConfig'
import { IUserDocument, IUserResponse } from '../config/type/IUser'
import PokemonRepository from '../repository/PokemonRepository'

const pokemonRepository = new PokemonRepository()

export const isUserAuthorized = (authenticatedUser: IUserDocument, targetUser: IUserDocument): boolean => {
  return authenticatedUser.role === USER_ROLES.ADMIN || authenticatedUser._id.toString() === targetUser._id.toString()
}

const deleteFromUser = (user: IUserResponse, ...fields: Array<string>) => {
  fields.forEach((field: string) => delete user[field])
}

export const abstractUserBasedOnAuthorizationLevel = (authenticatedUser: IUserDocument, response: IUserDocument): IUserResponse => {
  const user: IUserResponse = response.toObject()
  user.pokemons = pokemonRepository.populatePokemons(response.pokemons)
  const { PASSWORD, __V, _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT } = USER_KEYS
  deleteFromUser(user, PASSWORD, __V)
  if (authenticatedUser.role !== USER_ROLES.ADMIN && authenticatedUser._id.toString() !== response._id.toString()) {
    deleteFromUser(user, _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT)
  }
  return user
}
