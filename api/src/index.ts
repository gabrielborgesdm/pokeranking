import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import Router from './Router'
import { __dirname } from './helpers/ApiHelper'

const app = express()
const port = process.env.API_PORT || 3000

app.use(express.static(__dirname))
app.use(express.json())
app.use(Router)
app.listen(port, () => {
    console.log("Server started on port", port)
})