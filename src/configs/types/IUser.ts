import { IModel } from './IModel'
import { IUserPokemons, IUserPokemonsMutate } from './IPokemon'
import { IResponse } from './IResponse'

export type IUserType = {
  username: string;
  email?: string;
  bio?: string;
  password?: string;
  role?: string;
}

export type IUserAdd = {
  username: string;
  email: string;
  password: string;
  bio?: string;
  pokemons: Array<string>;
}

export type IUserUpdate = {
  bio?: string;
  pokemons: Array<string>;
  password?: string;
}

export interface IUserDocument extends IUserType, IUserPokemonsMutate, IModel {}

export interface IUserResponse extends IUserType, IUserPokemons, IResponse {}
