import { Logger } from '../helper/LoggingHelper'
import { POKEMON_TABLE_NAME } from '../model/domain/PokemonDomain'
import { type User } from '../model/domain/UserDomain'
import UserEntity from '../model/entity/UserEntity'

const log = Logger('UserRepository')

export default class UserRepository {
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

  async findById (_id: string): Promise<User | null> {
    let user: User | null = null

    try {
      user = await UserEntity.findById(_id).exec()
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

//   async get(query: object): Promise<IUserDocument> {
//     let user: IUserDocument = null
//     try {
//       user = await User.findOne(query).exec()
//     } catch (error) {
//       console.log(error)
//     }
//     return user
//   }

//   async getPaginated(pagination: any): Promise<Array<IUserDocument>> {
//     let users: Array<IUserDocument> = null
//     try {
//       users = await User.find().skip(pagination.skip).limit(pagination.limit).exec()
//     } catch (error) {
//       console.log(error)
//     }
//     return users
//   }
