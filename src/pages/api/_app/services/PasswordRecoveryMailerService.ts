import { MESSAGES } from '../../../../configs/APIConfig'
import { generateAccessToken } from '../helpers/AuthenticationHelpers'
import { buildPasswordRecoveryTemplate } from '../helpers/MailerHelpers'
import MailerService from './MailerService'

export default class PasswordRecoveryMailerService extends MailerService {
  lang: string
  host: string
  link: string

  constructor(lang: string, host: string) {
    super()
    this.lang = lang
    this.host = host
  }

  public sendAccountRecoveryEmail(userName: string, userEmail: string) {
    this.transporter.sendMail(this.getAccountRecoveryMailOptions(userName, userEmail), (error) => {
      if (error) {
        return console.log(`Error sending e-mail to ${userEmail}: ${error.message}`, error)
      }

      console.log('E-mail successfully sent to:', userEmail)
    })
  }

  private getAccountRecoveryMailOptions(userName: string, userEmail: string) {
    const link = this.getLink(userEmail)
    return {
      from: this.getMailerConfigs().user,
      to: [userEmail],
      subject: MESSAGES[this.lang].password_recovery,
      html: buildPasswordRecoveryTemplate(this.lang, userName, link)
    }
  }

  private getLink(userEmail: string) {
    const token = generateAccessToken({ email: userEmail })
    return `${this.host}/confirm-password-recovery/${token}`
  }
}
