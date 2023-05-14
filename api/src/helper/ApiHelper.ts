import path from 'path'
import { getEnvVariable } from './EnvHelper'

export const baseURL = getEnvVariable('API_BASE_URL', '')

export const _dirname = path.resolve()

export const buildApiRoute = (resource: string, path: string): string => `${baseURL}/${resource}/${path}`
