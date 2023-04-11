import mongoose from "mongoose"
import { Logger } from "../helpers/LoggingHelper"

export async function connect() {
    const databaseConnectionURL = process.env.DATABASE_CONNECTION_URL
    if(!databaseConnectionURL) {
        throw new Error("DATABASE_CONNECTION_URL environment variable is missing")
    }

    await mongoose.connect(databaseConnectionURL)
}