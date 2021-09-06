import { IModel } from './IModel'
import { IPokemon } from './IPokemon'
import { IResponse } from './IResponse'

export type IUserType = {
  _id?: string;
  username: string;
  avatar: string;
  email?: string;
  bio?: string;
  password?: string;
  pokemons?: Array<IPokemon>;
  role?: string;
}

export type IUsersType = {
  users: Array<IUserType>
}

export type IUserAdd = {
  username: string;
  avatar?: number
  email: string;
  password: string;
  bio?: string;
  pokemons: Array<string>;
}

export type IUserUpdate = {
  bio?: string;
  avatar?: number
  pokemons: Array<string>;
  password?: string;
}

export interface IUserDocument extends IUserType, IModel {}

export interface IUserResponse extends IResponse {
  user: IUserType;
}

export interface IUsersResponse extends IUsersType, IResponse {}
