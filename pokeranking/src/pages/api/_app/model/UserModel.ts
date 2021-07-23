import mongoose from '../config/DatabaseConfig'
import { USER_ROLES } from '../config/APIConfig'
import { IUserInterface } from '../config/type/IUser'

const UserModel = new mongoose.Schema<IUserInterface>({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  bio: { type: String, require: false },
  country: { type: String, require: true },
  role: { type: String, default: USER_ROLES.USER },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.models.Users || mongoose.model<IUserInterface>('Users', UserModel)
export default User
