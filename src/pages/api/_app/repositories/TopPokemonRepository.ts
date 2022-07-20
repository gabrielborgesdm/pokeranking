import { ITopPokemonResponse, ITopPokemonDocument } from '../../../../configs/types/ITopPokemon'
import TopPokemon from '../models/TopPokemonModel'

export default class TopPokemonRepository {
  async getAll() {
    let topPokemons: Array<ITopPokemonDocument> = null
    try {
      topPokemons = await TopPokemon.find().exec()
    } catch (error) {
      console.log(error)
    }
    return topPokemons
  }

  async getById(id: number): Promise<ITopPokemonDocument> {
    let topPokemon: ITopPokemonDocument = null
    try {
      topPokemon = await TopPokemon.findOne({ id }).exec()
    } catch (error) {
      console.log(error)
    }
    return topPokemon
  }

  async get(query: object): Promise<ITopPokemonDocument> {
    let topPokemon: ITopPokemonDocument = null
    try {
      topPokemon = await TopPokemon.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return topPokemon
  }

  async delete(id: number): Promise<ITopPokemonDocument> {
    let topPokemon: ITopPokemonDocument = null
    try {
      topPokemon = await TopPokemon.findOneAndDelete({ id }).exec()
    } catch (error) {
      console.log(error)
    }
    return topPokemon
  }

  async store(topPokemonInfo: ITopPokemonResponse): Promise<ITopPokemonDocument> {
    let topPokemon: ITopPokemonDocument = null
    try {
      topPokemon = await TopPokemon.create(topPokemonInfo)
    } catch (error) {
      console.log(error)
    }
    return topPokemon
  }

  async update(pokemonId: string, topPokemonInfo: ITopPokemonResponse): Promise<ITopPokemonDocument> {
    let topPokemon: ITopPokemonDocument = null
    try {
      topPokemon = await TopPokemon.findOneAndUpdate({ pokemon: pokemonId }, topPokemonInfo, {
        new: true
      })
    } catch (error) {
      console.log(error)
    }
    return topPokemon
  }
}
