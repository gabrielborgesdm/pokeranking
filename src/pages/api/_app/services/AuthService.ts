import { ERROR, FORBIDDEN, UNAUTHORIZED, USER_NOT_FOUND } from '../../../../configs/APIConfig'
import { hashPassword } from '../helpers/AuthenticationHelpers'
import UserRepository from '../repositories/UserRepository'
import { SUCCESS } from './../../../../configs/APIConfig'
import { IResponse } from './../../../../configs/types/IResponse'
import { verifyTokenAndGetEmail } from './../helpers/AuthenticationHelpers'
import PasswordRecoveryMailerService from './PasswordRecoveryMailerService'

export default class AuthService {
    lang: string
    host: string
    userRepository: UserRepository

    constructor(lang: string, host: string) {
      this.userRepository = new UserRepository()
      this.lang = lang
      this.host = host
    }

    recoverPassword = async (email: string): Promise<IResponse> => {
      const user = await this.userRepository.get({ email })
      if (!user) {
        return USER_NOT_FOUND
      }
      await new PasswordRecoveryMailerService(this.lang, this.host).sendAccountRecoveryEmail(user.username, user.email)
      return SUCCESS
    }

    confirmPasswordRecovery = async (password: string, accessToken: string): Promise<IResponse> => {
      let email: string
      try {
        email = verifyTokenAndGetEmail(accessToken)
        if (!email) {
          return FORBIDDEN
        }
      } catch (error) {
        return UNAUTHORIZED
      }

      const user = await this.userRepository.get({ email })
      if (!user) {
        return USER_NOT_FOUND
      }

      return await this.changeAccountPassword(user._id, password)
    }

    changeAccountPassword = async (id: string, password: string): Promise<IResponse> => {
      if (!id) {
        return USER_NOT_FOUND
      }
      const hash = await hashPassword(password)
      const updatedUser = await this.userRepository.update(id, { password: hash })
      return updatedUser ? SUCCESS : ERROR
    }
}
