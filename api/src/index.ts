import express from 'express'
import i18n from './config/I18nConfig'
import router from './Router'
import { publicDirectory } from './helper/ApiHelper'
import { connect } from './config/DatabaseConfig'
import LoggerService from './service/LoggingService'
import { getEnvVariable } from './helper/EnvHelper'

const app = express()
const port = getEnvVariable('API_PORT', 3000)
const logger = new LoggerService('main')

export async function run (): Promise<void> {
  app.use(express.static(publicDirectory))
  app.use(express.json())
  app.use(i18n.init)
  app.use(router)

  await connect()

  app.listen(port, () => {
    logger.log('Server started on port', port)
  })
}

void run()
