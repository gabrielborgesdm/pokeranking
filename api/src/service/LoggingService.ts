import debug from 'debug'

export default class LoggerService {
  private readonly debug: debug.Debugger
  constructor (module: string) {
    this.debug = debug(`api:${module}`)
  }

  log (...args: any[]): void {
    this.debug(args)
  }
}
