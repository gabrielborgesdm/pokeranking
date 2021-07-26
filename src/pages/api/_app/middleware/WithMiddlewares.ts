import { NextApiHandler, NextApiResponse } from 'next'
import Migration from '../config/migration/Migration'
import { IRequest } from '../config/type/IRequest'
import AuthenticationMiddleware from './AuthenticationMiddleware'

export const middlewares = {
  authentication: AuthenticationMiddleware
}

export interface MiddlewareInterface {
  success: boolean,
  code: number,
  message: string
}

const migration = new Migration()

const withMiddlewares = (handler: NextApiHandler, ...middlewares: Array<Function>) => {
  return async (req: IRequest, res: NextApiResponse) => {
    if (!migration.isMigrated) await migration.executeMigrations()
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
