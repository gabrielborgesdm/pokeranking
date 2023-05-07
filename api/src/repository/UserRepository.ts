import { Logger } from '../helper/LoggingHelper'
import { type User } from '../model/domain/UserDomain'
import UserEntity from '../model/entity/UserEntity'

const log = Logger('UserRepository')

export default class UserRepository {
  async findById (_id: string): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findById(_id).exec()
    } catch (error) {
      log(error)
    }

    return user
  }

  async findBy (query: Partial<User>): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findOne(query).exec()
    } catch (error) {
      log(error)
    }

    return user
  }

  async getAll (): Promise<User[]> {
    let users: User[] = []

    try {
      users = await UserEntity.find().exec()
    } catch (error) {
      log(error)
    }

    return users
  }

  async create (payload: User): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.create(payload)
    } catch (error) {
      log(error)
    }

    return user
  }

  async update (_id: string, payload: Partial<User>): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findByIdAndUpdate(_id, payload, { new: true })
    } catch (error) {
      log(error)
    }

    return user
  }

  async delete (_id: string): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findByIdAndDelete(_id).exec()
    } catch (error) {
      log(error)
    }

    return user
  }
}
