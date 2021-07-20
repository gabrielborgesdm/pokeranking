import User, { AddUserInterface, UpdateUserInterface, UserInterface } from '../model/UserModel'

export default class UserRepository {
  async getAll (): Promise<Array<UserInterface>> {
    let users: Array<UserInterface> = null
    try {
      users = await User.find().exec()
    } catch (error) {
      console.log(error)
    }
    return users
  }

  async getById (_id: string): Promise<UserInterface> {
    let user: UserInterface = null
    try {
      user = await User.findById(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async get (query: object): Promise<UserInterface> {
    let user: UserInterface = null
    try {
      user = await User.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async delete (_id: string): Promise<UserInterface> {
    let user: UserInterface = null
    try {
      user = await User.findByIdAndDelete(_id).exec()
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async store (userInfo: AddUserInterface): Promise<UserInterface> {
    let user: UserInterface = null
    try {
      user = await User.create(userInfo)
    } catch (error) {
      console.log(error)
    }
    return user
  }

  async update (_id: string, userInfo: UpdateUserInterface): Promise<UserInterface> {
    let user: UserInterface = null
    try {
      user = await User.findByIdAndUpdate(_id, userInfo, { new: true })
    } catch (error) {
      console.log(error)
    }
    return user
  }
}
