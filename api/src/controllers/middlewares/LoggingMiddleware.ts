import { NextFunction, Request, Response, Router } from "express"
import { Logger } from "../../helpers/LoggingHelper"


const log = Logger('requests')

export default function addLoggingMiddlewares (router: Router) {
    router.all("/*", logRequests)
}

async function logRequests (request: Request, response: Response, next: NextFunction) {
    log(request.query, `request at: ${new Date().toISOString()}`)
    next()
}