import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import Router from './Router'
import { __dirname } from './helpers/ApiHelper'
import { connect } from './configs/DatabaseConfig'

const app = express()
const port = process.env.API_PORT

async function run () {
    app.use(express.static(__dirname))
    app.use(express.json())
    app.use(Router)
    await connect()
    app.listen(port, () => {
        console.log("[Server] Server started on port", port)
    })
}

run()