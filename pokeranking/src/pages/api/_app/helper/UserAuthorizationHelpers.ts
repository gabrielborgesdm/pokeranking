import { USER_KEYS, USER_ROLES } from '../config/APIConfig'
import { IUserInterface } from '../config/types/IUser'

export const isUserAuthorized = (authenticatedUser: IUserInterface, targetUser: IUserInterface): boolean => {
  return authenticatedUser.role === USER_ROLES.ADMIN || authenticatedUser._id.toString() === targetUser._id.toString()
}

const deleteFromUser = (user: IUserInterface, ...fields: Array<string>) => {
  fields.forEach((field: string) => delete user[field])
}

export const abstractUserBasedOnAuthorizationLevel = (authenticatedUser: IUserInterface, response: IUserInterface): IUserInterface => {
  const user = response.toObject()
  const { PASSWORD, __V, _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT } = USER_KEYS
  deleteFromUser(user, PASSWORD, __V)
  if (authenticatedUser.role !== USER_ROLES.ADMIN && authenticatedUser._id.toString() !== response._id.toString()) {
    deleteFromUser(user, _ID, ROLE, EMAIL, CREATED_AT, UPDATED_AT)
  }
  return user
}
