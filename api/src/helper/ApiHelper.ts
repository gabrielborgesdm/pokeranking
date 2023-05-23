import path from 'path'
import { getEnvVariable } from './EnvHelper'

export const baseURL: string = getEnvVariable('API_BASE_URL', '')

export const _dirname: string = path.resolve()

export const publicDirectory: string = path.resolve('public')

export const buildApiRoute = (resource: string, path: string): string => `${baseURL}/${resource}/${path}`
