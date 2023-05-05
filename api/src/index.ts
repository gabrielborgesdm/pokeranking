import * as dotenv from 'dotenv'

import express from 'express'
import Router from './Router'
import { Logger } from './helper/LoggingHelper'
import { _dirname } from './helper/ApiHelper'
import { connect } from './config/DatabaseConfig'
dotenv.config()

const app = express()
const port = process.env.API_PORT !== undefined ? process.env.API_PORT : 3000
const log = Logger('main')

export async function run (): Promise<void> {
  app.use(express.static(_dirname))
  app.use(express.json())
  app.use(Router)
  await connect()
  app.listen(port, () => {
    log('Server started on port', port)
  })
}

void run()
