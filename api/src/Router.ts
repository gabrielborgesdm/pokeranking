import express from "express"
import { addUserRoutes } from "./controllers/UserController"

const router = express.Router()

addUserRoutes(router)

export default router