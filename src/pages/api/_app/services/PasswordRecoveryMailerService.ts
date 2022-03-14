import { MESSAGES } from '../../../../configs/APIConfig'
import { generateAccessToken } from '../helpers/AuthenticationHelpers'
import { buildPasswordRecoveryTemplate } from '../helpers/MailerHelpers'
import MailerService from './MailerService'

export default class PasswordRecoveryMailerService extends MailerService {
  lang: string
  userName: string
  userEmail: string
  link: string

  constructor(lang: string, userName: string, userEmail: string) {
    super()
    this.lang = lang
    this.userName = userName
    this.userEmail = userEmail
    this.buildLink()
  }

  private buildLink() {
    const token = generateAccessToken({ email: this.userEmail })
    this.link = `http://localhost:3000/confirmPassword/${token}`
  }

  public sendAccountRecoveryEmail() {
    this.transporter.sendMail(this.getAccountRecoveryMailOptions(), (error) => {
      if (error) {
        return console.log(`Error sending e-mail to ${this.userEmail}: ${error.message}`, error)
      }

      console.log('E-mail successfully sent to:', this.userEmail)
    })
  }

  private getAccountRecoveryMailOptions() {
    return {
      from: this.getMailerConfigs().user,
      to: [this.userEmail],
      subject: MESSAGES[this.lang].password_recovery,
      html: buildPasswordRecoveryTemplate(this.lang, this.userName, this.link)
    }
  }
}
