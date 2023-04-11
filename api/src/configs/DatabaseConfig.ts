import mongoose from "mongoose"

export async function connect() {
    const databaseConnectionURL = process.env.DATABASE_CONNECTION_URL
    if(!databaseConnectionURL) {
        throw new Error("[ENV] DATABASE_CONNECTION_URL environment variable is missing")
    }

    await mongoose.connect(databaseConnectionURL)
    .then(() => {
        console.log('[MongoDB] Connected successfully to the database')
    })
    .catch(error => {
        throw new Error(`[MongoDB] Failed to connect with the server: ${error}`)
    })
}