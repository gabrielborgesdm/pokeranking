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

  public async sendAccountRecoveryEmail(userName: string, userEmail: string) {
    await new Promise((resolve, reject) => {
      this.transporter.sendMail(this.getAccountRecoveryMailOptions(userName, userEmail), (error, info) => {
        if (error) {
          console.log(`Error sending e-mail to ${userEmail}: ${error.message}`, error)
          reject(error)
        }

        console.log('E-mail successfully sent to:', userEmail, info)
        resolve(info)
      })
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
    return `${this.host}/${this.lang}/confirm-password-recovery/${token}`
  }
}
