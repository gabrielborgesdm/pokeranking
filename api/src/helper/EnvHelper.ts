import * as dotenv from 'dotenv'

import InternalServerError from '../model/exception/InternalServerError'

dotenv.config()

export function getEnvVariable (key: string, defaultValue: any = undefined): string {
  const variable = process.env[key]

  if (variable === undefined && defaultValue === undefined) {
    throw new InternalServerError(`Environment variable ${key} is not defined`)
  }

  return variable ?? defaultValue
}
