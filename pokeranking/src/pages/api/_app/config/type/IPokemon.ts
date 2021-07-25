import { IModel } from './IModel'
import { IUser } from './IUser'
import pokemons from '../../../../../assets/pokemon.json/pokemons.json'

export type IPokemon = typeof pokemons[0]

export interface IUserPokemons extends IModel{
  user: IUser,
  pokemons: Array<IPokemon>
}

export interface IUserPokemonsAdd {
  user: string,
  pokemons: Array<string>
}

export interface IUserPokemonsUpdate {
  pokemons: Array<string>
}
