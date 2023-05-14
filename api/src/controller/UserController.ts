/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router, type Request, type Response } from 'express'
import { buildApiRoute } from '../helper/ApiHelper'
import UserService from '../service/UserService'

const URL_PREFIX = 'users'

export function addUserRoutes (router: Router): void {
  router.post(buildApiRoute(URL_PREFIX, 'sign-in'), recoverPassword)
  router.post(buildApiRoute(URL_PREFIX, 'password-recovery'), signIn)
}

function signIn (request: Request, response: Response): void {
  response.json(request.__('test'))
}

async function recoverPassword (request: Request, response: Response): Promise<void> {
  const email = request.body.email as string
  await new UserService(String(request.headers.host)).recoverPassword(email, request.__)
}
