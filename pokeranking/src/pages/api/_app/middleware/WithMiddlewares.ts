import { NextApiHandler, NextApiResponse } from 'next'
import { IRequest } from '../config/types/IRequest'
import AuthenticationMiddleware from './AuthenticationMiddleware'

export const middlewares = {
  authentication: AuthenticationMiddleware
}

export interface MiddlewareInterface {
  success: boolean,
  code: number,
  message: string
}

const withMiddlewares = (handler: NextApiHandler, ...middlewares: Array<Function>) => {
  return async (req: IRequest, res: NextApiResponse) => {
    for (const middleware of middlewares) {
      const response: MiddlewareInterface = await middleware(req)
      if (!response.success) {
        return res.status(response.code).json(response)
      }
    }
    return handler(req, res)
  }
}

export default withMiddlewares
