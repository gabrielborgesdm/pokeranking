import { USER_ROLES } from '../config/APIConfig'
import { IUserInterface } from '../config/types/IUser'

export const isUserAuthorized = (authenticatedUser: IUserInterface, targetUser: IUserInterface): boolean => {
  return authenticatedUser.role === USER_ROLES.ADMIN || authenticatedUser._id.toString() === targetUser._id.toString()
}

export const abstractUserBasedOnAuthorizationLevel = (authenticatedUser: IUserInterface, response: IUserInterface): IUserInterface => {
  if (authenticatedUser.role === USER_ROLES.ADMIN || authenticatedUser._id.toString() === response._id.toString()) {
    return response.toObject()
  }
  const { username, bio } = response
  return { username, bio }
}
