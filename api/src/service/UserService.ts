import NotFoundException from '../model/exception/NotFoundExceptions'
import UserRepository from '../repository/UserRepository'
import PasswordRecoveryMailerService from './mailer/PasswordRecoveryMailerService'

export default class UserService {
  hostUrl: string
  userRepository: UserRepository
  passwordRecoveryMailerService: PasswordRecoveryMailerService

  constructor (hostUrl: string) {
    this.hostUrl = hostUrl
    this.userRepository = new UserRepository()
    this.passwordRecoveryMailerService = new PasswordRecoveryMailerService(hostUrl)
  }

  recoverPassword = async (email: string, translate: (key: string) => string): Promise<void> => {
    const user = await this.userRepository.findBy({ email })

    if (user == null) {
      throw new NotFoundException('User not found')
    }

    await this.passwordRecoveryMailerService.sendEmail(user.username, String(user.email), translate)
  }

  // confirmPasswordRecovery = async (password: string, accessToken: string): Promise<IResponse> => {
  //   let email: string
  //   try {
  //     email = verifyTokenAndGetEmail(accessToken)
  //     if (!email) {
  //       return FORBIDDEN
  //     }
  //   } catch (error) {
  //     return UNAUTHORIZED
  //   }

  //   const user = await this.userRepository.get({ email })
  //   if (!user) {
  //     return USER_NOT_FOUND
  //   }

  //   return await this.changeAccountPassword(user._id, password)
  // }

  // changeAccountPassword = async (id: string, password: string): Promise<IResponse> => {
  //   if (!id) {
  //     return USER_NOT_FOUND
  //   }
  //   const hash = await hashPassword(password)
  //   const updatedUser = await this.userRepository.update(id, { password: hash })
  //   return (updatedUser != null) ? SUCCESS : ERROR
  // }
}
