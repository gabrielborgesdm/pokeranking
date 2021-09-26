import { NextApiHandler, NextApiResponse } from 'next'
import Migration from '../migrations/Migration'
import { IMiddleware } from '../../../../configs/types/IMiddleware'
import { IRequest } from '../../../../configs/types/IRequest'
import AuthenticationMiddleware from './AuthenticationMiddleware'
import ValidationMiddleware from './ValidationMiddleware'
import { sendResponse } from '../helpers/ResponseHelpers'
import { ERROR } from '../../../../configs/APIConfig'
import AuthorizationMiddleware from './AuthorizationMiddleware'

export const AUTHENTICATION = 'authentication'
export const AUTHORIZATION = 'authorization'
export const VALIDATION = 'validation'

const callMiddleware = {
  authentication: AuthenticationMiddleware,
  validation: ValidationMiddleware,
  authorization: AuthorizationMiddleware
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
    const isValidated = await checkAndExecuteMigrations(req, res, middlewares)
    if (isValidated) await handler(req, res)
  }
}

const checkAndExecuteMigrations = async (req: IRequest, res: NextApiResponse, middlewares: Array<IMiddleware>): Promise<boolean> => {
  if (!migration.isMigrated) await migration.executeMigrations()
  if (!migration.isMigrated) {
    sendResponse(req, res, ERROR)
    return false
  }
  return await executeMiddlewares(req, res, middlewares)
}

export default withMiddlewares
