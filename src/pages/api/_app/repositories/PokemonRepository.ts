import { IPokemon, IPokemonDocument } from '../../../../configs/types/IPokemon'
import Pokemon from '../models/PokemonModel'

export default class PokemonRepository {
  allPokemons = null

  async getThenLoadAllPokemons (): Promise<Array<IPokemonDocument>> {
    if (this.allPokemons === null) await this.loadAllPokemons()
    else this.loadAllPokemons()
    return this.allPokemons
  }

  async loadAllPokemons() {
    let pokemons: Array<IPokemonDocument> = null
    try {
      pokemons = await Pokemon.find().exec()
    } catch (error) {
      console.log(error)
    }
    this.allPokemons = pokemons
  }

  async getAll() {
    let pokemons: Array<IPokemonDocument> = null
    try {
      pokemons = await Pokemon.find().exec()
    } catch (error) {
      console.log(error)
    }
    return pokemons
  }

  async getById(id: number): Promise<IPokemonDocument> {
    let pokemon: IPokemonDocument = null
    try {
      pokemon = await Pokemon.findOne({ id }).exec()
    } catch (error) {
      console.log(error)
    }
    return pokemon
  }

  async get(query: object): Promise<IPokemonDocument> {
    let pokemon: IPokemonDocument = null
    try {
      pokemon = await Pokemon.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return pokemon
  }

  async delete(id: number): Promise<IPokemonDocument> {
    let pokemon: IPokemonDocument = null
    try {
      pokemon = await Pokemon.findOneAndDelete({ id }).exec()
    } catch (error) {
      console.log(error)
    }
    return pokemon
  }

  async store(pokemonInfo: IPokemon): Promise<IPokemonDocument> {
    let pokemon: IPokemonDocument = null
    try {
      pokemon = await Pokemon.create(pokemonInfo)
    } catch (error) {
      console.log(error)
    }
    return pokemon
  }

  async update(id: number, pokemonInfo: IPokemon): Promise<IPokemonDocument> {
    let pokemon: IPokemonDocument = null
    try {
      pokemon = await Pokemon.findOneAndUpdate({ id }, pokemonInfo, {
        new: true
      })
    } catch (error) {
      console.log(error)
    }
    return pokemon
  }
}
