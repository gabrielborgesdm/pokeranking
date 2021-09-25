import { IModel } from './IModel'
import { IResponse } from './IResponse'

export interface IPokemon {
  name: String;
  image: String;
}

export interface IPokemonsResponse extends IResponse {
  pokemons: Array<IPokemon>;
}

export interface IPokemonDocument extends IPokemon, IModel {}

// lixo abaixo
export interface IUserPokemons {
  pokemons: Array<IPokemon>;
}

export interface IPokemonMutate {
  pokemon: number;
  note?: string;
}

export interface IUserPokemonsMutate {
  pokemons: Array<IPokemonMutate>;
}
