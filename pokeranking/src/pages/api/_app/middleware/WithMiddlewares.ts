import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
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
  return async (req: NextApiRequest, res: NextApiResponse) => {
    for (const middleware of middlewares) {
      const response: MiddlewareInterface = await middleware(req, res)
      if (!response.success) {
        const { code, ...rest } = response
        return res.status(code).json(rest)
      }
    }
    return handler(req, res)
  }
}

export default withMiddlewares
