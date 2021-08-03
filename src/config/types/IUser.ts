import { IMessage } from './IMessage'
import { IModel } from './IModel'
import { IUserPokemon, IUserPokemonMutate } from './IPokemon'

export interface IUserDocument extends IModel{
  username: string;
  email: string;
  bio?: string;
  pokemons: Array<IUserPokemonMutate>;
  password: string;
  role: string;
}

export interface IUserResponse extends IModel{
  username: string;
  email?: string;
  bio?: string;
  pokemons: Array<IUserPokemon>;
  password?: string;
  role?: string;
}

export interface ILoginResponse extends IMessage{
  token?: string;
}

export interface IUserAdd {
  username: string;
  password: string;
  email: string;
  bio?: string;
  pokemons: Array<string>;
}

export interface IUserUpdate {
  bio?: string;
  pokemons: Array<string>;
  password?: string;
}
