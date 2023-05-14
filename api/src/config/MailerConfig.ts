import nodemailer, { type Transporter } from 'nodemailer'
import { getEnvVariable } from '../helper/EnvHelper'

export interface MailerConfig {
  host: string
  port: number
  user: string
  password: string
}

export function getMailerTransporter (): Transporter {
  const { host, port, user, password: pass } = getMailerConfig()

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

export function getMailerConfig (): MailerConfig {
  return {
    host: getEnvVariable('MAILER_HOST'),
    port: parseInt(getEnvVariable('MAILER_PORT')),
    user: getEnvVariable('MAILER_USER'),
    password: getEnvVariable('MAILER_PASSWORD')
  }
}
