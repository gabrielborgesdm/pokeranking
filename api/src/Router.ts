import express from 'express'
import { addUserRoutes } from './controller/UserController'
import addLoggingMiddlewares from './controller/middleware/LoggingMiddleware'

const router = express.Router()

addLoggingMiddlewares(router)
addUserRoutes(router)

export default router
