import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import Router from './Router'
import { __dirname } from './helpers/ApiHelper'
import { connect } from './configs/DatabaseConfig'
import { Logger } from './helpers/LoggingHelper'

const app = express()
const port = process.env.API_PORT
const log = Logger('main')

async function run () {
    app.use(express.static(__dirname))
    app.use(express.json())
    app.use(Router)
    await connect()
    app.listen(port, () => {
        log("Server started on port", port)
    })
}

run()