import { IModel } from './IModel'
import { IResponse } from './IResponse'

export interface IPokemon {
  name: string
  image: string
  id?: number
}

export interface IPokemonsResponse extends IResponse {
  pokemons: Array<IPokemon>
}

export interface IPokemonDocument extends IPokemon, IModel {}
