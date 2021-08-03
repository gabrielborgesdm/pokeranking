import { NextApiHandler, NextApiResponse } from 'next'
import Migration from '../migration/Migration'
import { IMiddleware } from '../../../../config/types/IMiddleware'
import { IRequest } from '../../../../config/types/IRequest'
import AuthenticationMiddleware from './AuthenticationMiddleware'
import ValidationMiddleware from './ValidationMiddleware'

export const AUTHENTICATION = 'authentication'
export const VALIDATION = 'validation'

const callMiddleware = {
  authentication: AuthenticationMiddleware,
  validation: ValidationMiddleware
}

const migration = new Migration()

const executeMiddlewares = async (req: IRequest, res: NextApiResponse, middlewares: Array<IMiddleware>): Promise<boolean> => {
  for (const middleware of middlewares) {
    const isOkay = await callMiddleware[middleware.name](req, res, middleware.parameters)
    if (!isOkay) return false
  }
  return true
}

const withMiddlewares = (handler: NextApiHandler, ...middlewares: Array<IMiddleware>) => {
  return async (req: IRequest, res: NextApiResponse) => {
    if (!migration.isMigrated) await migration.executeMigrations()
    const isOkay = await executeMiddlewares(req, res, middlewares)
    if (isOkay) await handler(req, res)
  }
}

export default withMiddlewares
