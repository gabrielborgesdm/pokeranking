import { USER_NOT_FOUND } from '../../../../configs/APIConfig'
import UserRepository from '../repositories/UserRepository'
import { SUCCESS } from './../../../../configs/APIConfig'
import { IResponse } from './../../../../configs/types/IResponse'
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
      new PasswordRecoveryMailerService(this.lang, this.host).sendAccountRecoveryEmail(user.username, user.email)
      return SUCCESS
    }
}
