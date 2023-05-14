import LoggerService from '../service/LoggingService'
import { type User } from '../model/domain/UserDomain'
import UserEntity from '../model/entity/UserEntity'

export default class UserRepository {
  pokemonPath = 'userPokemon.pokemon'
  logger = new LoggerService('UserRepository')

  async findById (_id: string): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findById(_id).populate(this.pokemonPath).exec()
    } catch (error) {
      this.logger.log(error)
    }

    return user
  }

  async findBy (query: Partial<User>): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findOne(query).populate(this.pokemonPath).exec()
    } catch (error) {
      this.logger.log(error)
    }

    return user
  }

  async getAll (): Promise<User[]> {
    let users: User[] = []

    try {
      users = await UserEntity.find().populate(this.pokemonPath).exec()
    } catch (error) {
      this.logger.log(error)
    }

    return users
  }

  async create (payload: User): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.create(payload)
    } catch (error) {
      this.logger.log(error)
    }

    return user
  }

  async update (_id: string, payload: Partial<User>): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findByIdAndUpdate(_id, payload, { new: true })
    } catch (error) {
      this.logger.log(error)
    }

    return user
  }

  async delete (_id: string): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findByIdAndDelete(_id).exec()
    } catch (error) {
      this.logger.log(error)
    }

    return user
  }
}
