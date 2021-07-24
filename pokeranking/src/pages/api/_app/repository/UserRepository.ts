import { IUserAdd, IUser, IUserUpdate } from '../config/type/IUser'
import User from '../model/UserModel'

export default class UserRepository {
  async getAll (): Promise<Array<IUser>> {
    let users: Array<IUser> = null
    try {
      users = await User.find().exec()
    } catch (error) {
      console.log(error)
    }
    return users
  }

  async getById (_id: string): Promise<IUser> {
    let user: IUser = null
    try {
      user = await User.findById(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async get (query: object): Promise<IUser> {
    let user: IUser = null
    try {
      user = await User.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async delete (_id: string): Promise<IUser> {
    let user: IUser = null
    try {
      user = await User.findByIdAndDelete(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async store (userInfo: IUserAdd): Promise<IUser> {
    let user: IUser = null
    try {
      user = await User.create(userInfo)
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async update (_id: string, userInfo: IUserUpdate): Promise<IUser> {
    let user: IUser = null
    try {
      user = await User.findByIdAndUpdate(_id, userInfo, { new: true })
    } catch (error) {
      console.log(error)
    }
    return user
  }
}
