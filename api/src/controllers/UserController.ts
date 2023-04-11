import { Request, Response, Router } from "express";
import { baseURL } from "../helpers/ApiHelper";

const URL_PREFIX = "users"

export function addUserRoutes (router: Router) {
    router.post(`${baseURL}/${URL_PREFIX}/login`, signIn)
}

async function signIn (request: Request, response: Response): Promise<Response> {
    return response.json() 
}
