import { type NextFunction, type Request, type Response, type Router } from 'express'
import { Logger } from '../../helper/LoggingHelper'

const log = Logger('requests')

export default function addLoggingMiddlewares (router: Router): void {
  router.use(logRequests)
}

function logRequests (request: Request, response: Response, next: NextFunction): void {
  log(request.query, `request at: ${new Date().toISOString()}`)
  next()
}
