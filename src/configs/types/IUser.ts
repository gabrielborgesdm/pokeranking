import { IModel } from './IModel'
import { IPokemon } from './IPokemon'
import { IResponse } from './IResponse'

export type IUser = {
  _id?: string;
  username: string;
  avatar: string;
  email?: string;
  bio?: string;
  password?: string;
  pokemons?: Array<IPokemon>;
  role?: string;
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

export interface IUserDocument extends IUser, IModel {}

export interface IUserResponse extends IResponse {
  user: IUser;
}

export interface IUsersResponse extends IResponse {
  users: IUser[];
}
