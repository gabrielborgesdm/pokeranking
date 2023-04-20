import path from 'path'

export const baseURL = process.env.API_BASE_URL !== undefined ? process.env.API_BASE_URL : ''

export const _dirname = path.resolve()

export const buildApiRoute = (resource: string, path: string): string => `${baseURL}/${resource}/${path}`
