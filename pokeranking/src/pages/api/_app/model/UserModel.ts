import mongoose from '../config/DatabaseConfig'
import { Document } from 'mongoose'

export interface UserInterface extends Document {
  _id: string,
  username: string,
  email: string,
  bio?: string,
  password: string,
  updatedAt: number,
  createdAt: number
}

export interface AddUserInterface {
  username: string,
  email: string,
  bio?: string,
  password: string,
}

export interface UpdateUserInterface {
  bio?: string,
  password?: string
}

const UserModel = new mongoose.Schema<UserInterface>({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  bio: { type: String, require: false },
  country: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.models.Users || mongoose.model<UserInterface>('Users', UserModel)
export default User
