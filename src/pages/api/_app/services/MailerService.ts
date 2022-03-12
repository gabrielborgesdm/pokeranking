import nodemailer from 'nodemailer'

export default class MailerService {
  private buildTransporter() {
    const { host, port, user, pass } = getMailerConfigs()
    return nodemailer.createTransport({
      host,
      port,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user,
        pass
      }
    })
  }

  private getMailerConfigs() {
    const host = process.env.MAILER_HOST
    const port = process.env.MAILER_PORT
    const user = process.env.MAILER_USER
    const pass = process.env.MAILER_PASSWORD
    if (!host || !port || user || pass) {
      throw new Error('Check your .env file. Some mailer configs might be missing')
    }
  }
}
