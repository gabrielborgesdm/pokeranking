import debug from "debug"

export const Logger = ( moduleName: string = "main" ) => debug(`api:${moduleName}`)