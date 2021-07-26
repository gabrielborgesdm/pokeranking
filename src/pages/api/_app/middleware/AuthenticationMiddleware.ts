import { FORBIDDEN, SUCCESS, UNAUTHORIZED } from '../config/APIConfig'
import { IRequest } from '../config/type/IRequest'
import { verifyTokenAndGetUserId } from '../helper/AuthenticationHelpers'
import UserRepository from '../repository/UserRepository'
import { MiddlewareInterface } from './WithMiddlewares'

const userRepository = new UserRepository()

const getTokenFromRequest = (req: IRequest): string => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  return token
}

const validateAndAddUserToRequest = async (_id: string, req: IRequest) => {
  const response = await userRepository.getById(_id)
  if (!response) return false
  req.user = response.toObject()
  return true
}

const AuthenticationMiddleware = async (req: IRequest) : Promise<MiddlewareInterface> => {
  const token = getTokenFromRequest(req)
  if (!token) return UNAUTHORIZED
  const _id = verifyTokenAndGetUserId(token)
  if (!_id || !await validateAndAddUserToRequest(_id, req)) return FORBIDDEN
  return SUCCESS
}

export default AuthenticationMiddleware
