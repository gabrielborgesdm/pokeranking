import { type Request, type Response, type Router } from 'express'
import { baseURL } from '../helper/ApiHelper'

const URL_PREFIX = 'users'

export function addUserRoutes (router: Router): void {
  router.post(`${baseURL}/${URL_PREFIX}/login`, signIn)
}

function signIn (request: Request, response: Response): void {
  response.json()
}
