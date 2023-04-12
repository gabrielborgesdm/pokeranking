import debug, { type Debugger } from 'debug'

export const Logger = (moduleName: string = 'main'): Debugger => debug(`api:${moduleName}`)
