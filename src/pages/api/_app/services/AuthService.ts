import { IResponse } from './../../../../configs/types/IResponse'
import { SUCCESS } from './../../../../configs/APIConfig'
import { NextApiResponse } from 'next'
import { USER_NOT_FOUND } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import UserRepository from '../repositories/UserRepository'
import PasswordRecoveryMailerService from './PasswordRecoveryMailerService'

export default class AuthService {
    lang: string
    req: IRequest
    res: NextApiResponse
    userRepository: UserRepository

    constructor(lang: string) {
      this.userRepository = new UserRepository()
      this.lang = lang
    }

    recoverPassword = async (email: string): Promise<IResponse> => {
      const user = await this.userRepository.get({ email })
      console.log(email, user)
      if (!user) {
        return USER_NOT_FOUND
      }
      new PasswordRecoveryMailerService(this.lang, user.username, user.email).sendAccountRecoveryEmail()
      return SUCCESS
    }
}
