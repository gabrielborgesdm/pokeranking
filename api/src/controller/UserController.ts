import { type Router, type Request, type Response } from 'express'
import { buildApiRoute } from '../helper/ApiHelper'

const URL_PREFIX = 'users'

export function addUserRoutes (router: Router): void {
  router.post(buildApiRoute(URL_PREFIX, 'signIn'), signIn)
}

function signIn (request: Request, response: Response): void {
  response.json(request.__('test'))
}
