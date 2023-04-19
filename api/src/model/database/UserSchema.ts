import mongoose from 'mongoose'
import type User from '../entities/User'
import { ROLES } from '../entities/Roles'
import { USER_TABLE_NAME } from '../entities/User'
import { POKEMON_TABLE_NAME } from '../entities/Pokemon'

const UserSchema = new mongoose.Schema<User>({
  username: { type: String, require: true },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: POKEMON_TABLE_NAME },
  email: { type: String, require: true },
  password: { type: String, require: true },
  bio: { type: String, require: false },
  role: { type: String, default: ROLES.USER },
  pokemons: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model<User>(USER_TABLE_NAME, UserSchema)
