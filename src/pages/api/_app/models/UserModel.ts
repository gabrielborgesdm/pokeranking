import mongoose from '../../../../configs/DatabaseConfig'
import { USER_ROLES } from '../../../../configs/APIConfig'
import { IUserDocument } from '../../../../configs/types/IUser'

const UserModel = new mongoose.Schema<IUserDocument>({
  username: { type: String, require: true },
  avatar: { type: Number, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  bio: { type: String, require: false },
  country: { type: String, require: true },
  role: { type: String, default: USER_ROLES.USER },
  createdAt: { type: Date, default: Date.now },
  pokemons: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
})

const User =
  mongoose.models.Users || mongoose.model<IUserDocument>('Users', UserModel)
export default User
