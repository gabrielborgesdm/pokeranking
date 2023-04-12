import * as dotenv from 'dotenv'

import express from 'express'
import Router from './Router'
import { _dirname } from './helpers/ApiHelper'
import { connect } from './configs/DatabaseConfig'
import { Logger } from './helpers/LoggingHelper'
dotenv.config()

const app = express()
const port = process.env.API_PORT
const log = Logger('main')

async function run (): Promise<void> {
  app.use(express.static(_dirname))
  app.use(express.json())
  app.use(Router)
  await connect()
  app.listen(port, () => {
    log('Server started on port', port)
  })
}

void run()
