import { IUserAdd, IUserDocument } from '../../../../configs/types/IUser'
import User from '../models/UserModel'

export default class UserRepository {
  async getAll (): Promise<Array<IUserDocument>> {
    let users: Array<IUserDocument> = null
    try {
      users = await User.find().exec()
    } catch (error) {
      console.log(error)
    }
    return users
  }

  async getById (_id: string): Promise<IUserDocument> {
    let user: IUserDocument = null
    try {
      user = await User.findById(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async get (query: object): Promise<IUserDocument> {
    let user: IUserDocument = null
    try {
      user = await User.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async delete (_id: string): Promise<IUserDocument> {
    let user: IUserDocument = null
    try {
      user = await User.findByIdAndDelete(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async store (userInfo: IUserAdd): Promise<IUserDocument> {
    let user: IUserDocument = null
    try {
      user = await User.create(userInfo)
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async update (_id: string, userInfo: any): Promise<IUserDocument> {
    let user: any = null
    try {
      user = await User.findByIdAndUpdate(_id, userInfo, { new: true })
    } catch (error) {
      console.log(error)
    }
    return user
  }
}
