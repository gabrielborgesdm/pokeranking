import express from 'express'
import { addUserRoutes } from './controller/UserController'

const router = express.Router()

addUserRoutes(router)

export default router
