import { getMailerConfig, getMailerTransporter } from '../../config/MailerConfig'
import LoggerService from '../LoggingService'
import { buildPasswordRecoveryTemplate } from '../../view/email-template/PasswordRecoveryEmailTemplate'
import AuthenticationService from '../AuthenticationService'

export default class PasswordRecoveryMailerService {
  authenticationService: AuthenticationService
  logger: LoggerService
  hostUrl: string
  constructor (hostUrl: string) {
    this.authenticationService = new AuthenticationService()
    this.logger = new LoggerService('PasswordRecoveryMailerService')
    this.hostUrl = hostUrl
  }

  async sendEmail (username: string, email: string, translate: (key: string) => string): Promise<void> {
    const token = this.authenticationService.generateAccessToken({ email })
    const passwordRecoveryUrl = `${this.hostUrl}/${translate('lang')}/confirm-password-recovery/${token}`

    try {
      await getMailerTransporter().sendMail({
        from: getMailerConfig().user,
        to: [email],
        subject: translate('password_recovery'),
        html: buildPasswordRecoveryTemplate(username, passwordRecoveryUrl, translate)
      })
    } catch (error) {
      this.logger.log(error)
    }
  }
}
