import { NextApiRequest, NextApiResponse } from 'next'
import { SUCCESS, UNAUTHORIZED } from '../config/APIConfig'
import { MiddlewareInterface } from './WithMiddlewares'

const AuthenticationMiddleware = async (req: NextApiRequest, res: NextApiResponse) : Promise<MiddlewareInterface> => {
  // console.log('AuthenticationMiddleware')
  // return UNAUTHORIZED
  return SUCCESS
}

export default AuthenticationMiddleware
