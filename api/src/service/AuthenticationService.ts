import bcrypt from 'bcryptjs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import LoggerService from './LoggingService'
import { getEnvVariable } from '../helper/EnvHelper'

export interface Payload extends JwtPayload {
  _id: string
  email: string
}

export default class AuthenticationService {
  logger: LoggerService
  accessTokenSecret: string

  constructor () {
    this.logger = new LoggerService('AuthenticationService')
    this.accessTokenSecret = getEnvVariable('ACCESS_TOKEN_SECRET')
  }

  async hashPassword (password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async checkIsPasswordValid (reqPassword: string, accountHash: string): Promise<boolean> {
    return await bcrypt.compare(reqPassword, accountHash)
  }

  generateAccessToken (payload: object): string {
    return jwt.sign(payload, this.accessTokenSecret)
  }

  validateToken = (token: string): JwtPayload | null => {
    let payload: JwtPayload | null = null

    try {
      payload = jwt.verify(token, this.accessTokenSecret) as Payload
    } catch (error) {
      this.logger.log(error)
    }

    return payload
  }
}
