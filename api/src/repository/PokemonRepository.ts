import { Logger } from '../helper/LoggingHelper'
import { type Pokemon } from '../model/domain/PokemonDomain'
import PokemonEntity from '../model/entity/PokemonEntity'

const log = Logger('PokemonRepository')

export default class PokemonRepository {
  async findById (_id: string): Promise<Pokemon | null> {
    let pokemon: Pokemon | null = null

    try {
      pokemon = await PokemonEntity.findById(_id).exec()
    } catch (error) {
      log(error)
    }

    return pokemon
  }

  async findBy (query: Partial<Pokemon>): Promise<Pokemon | null> {
    let pokemon: Pokemon | null = null

    try {
      pokemon = await PokemonEntity.findOne(query).exec()
    } catch (error) {
      log(error)
    }

    return pokemon
  }

  async getAll (): Promise<Pokemon[]> {
    let pokemon: Pokemon[] = []

    try {
      pokemon = await PokemonEntity.find().exec()
    } catch (error) {
      log(error)
    }

    return pokemon
  }

  async create (payload: Pokemon): Promise<Pokemon | null> {
    let pokemon: Pokemon | null = null

    try {
      pokemon = await PokemonEntity.create(payload)
    } catch (error) {
      log(error)
    }

    return pokemon
  }

  async update (_id: string, payload: Partial<Pokemon>): Promise<Pokemon | null> {
    let pokemon: Pokemon | null = null

    try {
      pokemon = await PokemonEntity.findByIdAndUpdate(_id, payload, { new: true })
    } catch (error) {
      log(error)
    }

    return pokemon
  }

  async delete (_id: string): Promise<Pokemon | null> {
    let pokemon: Pokemon | null = null

    try {
      pokemon = await PokemonEntity.findByIdAndDelete(_id).exec()
    } catch (error) {
      log(error)
    }

    return pokemon
  }
}
