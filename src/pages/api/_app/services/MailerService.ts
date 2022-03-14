import nodemailer, { Transporter } from 'nodemailer'

export default class MailerService {
  transporter: Transporter;
  constructor() {
    this.transporter = this.buildTransporter()
  }

  protected buildTransporter() {
    const { host, port, user, pass } = this.getMailerConfigs()
    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass
      }
    })
  }

  protected getMailerConfigs() {
    const host = process.env.MAILER_HOST
    const port = process.env.MAILER_PORT
    const user = process.env.MAILER_USER
    const pass = process.env.MAILER_PASSWORD
    if (!host || !port || !user || !pass) {
      throw new Error('Check your .env file. Some mailer configs might be missing')
    }
    return { host, port, user, pass }
  }
}
