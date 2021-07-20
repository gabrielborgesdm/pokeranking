import mongoose, { Mongoose } from 'mongoose'

let client: Mongoose = null

if (!client) {
  const uri = String(process.env.DATABASE_CONNECTION_STRING)
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  mongoose.Promise = global.Promise
  client = mongoose
}

export default client
