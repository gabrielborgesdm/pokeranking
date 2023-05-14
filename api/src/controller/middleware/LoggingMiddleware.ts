import { type NextFunction, type Request, type Response, type Router } from 'express'
import LoggerService from '../../service/LoggingService'

const logger = new LoggerService('requests')

export default function addLoggingMiddlewares (router: Router): void {
  router.use(logRequests)
}

function logRequests (request: Request, response: Response, next: NextFunction): void {
  logger.log(request.query, `request at: ${new Date().toISOString()}`)

  next()
}
