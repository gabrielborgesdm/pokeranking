import { NextApiRequest, NextApiResponse } from 'next'
import { FORBIDDEN, SUCCESS, UNAUTHORIZED } from '../config/APIConfig'
import { isTokenValid } from '../helper/AuthenticationHelper'
import { MiddlewareInterface } from './WithMiddlewares'

const getTokenFromRequest = (req: NextApiRequest): string => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  return token
}
const AuthenticationMiddleware = async (req: NextApiRequest, res: NextApiResponse) : Promise<MiddlewareInterface> => {
  const token = getTokenFromRequest(req)
  if (!token) return UNAUTHORIZED
  if (!isTokenValid(token)) return FORBIDDEN
  return SUCCESS
}

export default AuthenticationMiddleware
