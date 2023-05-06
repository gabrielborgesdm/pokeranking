import mongoose from 'mongoose'
import { type User } from '../domain/UserDomain'
import { USER_TABLE_NAME } from '../domain/UserDomain'
import { POKEMON_TABLE_NAME } from '../domain/PokemonDomain'
import { RolesEnum } from '../domain/RoleDomain'

const UserEntity = new mongoose.Schema<User>({
  username: { type: String, require: true },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: POKEMON_TABLE_NAME },
  email: { type: String, require: true },
  password: { type: String, require: true },
  bio: { type: String, require: false },
  role: { type: String, default: RolesEnum.user },
  pokemon: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model<User>(USER_TABLE_NAME, UserEntity)
