import { IPokemon } from './IPokemon'

export interface IUserPokemon extends IPokemon{
    note?: string;
}

export interface IUserPokemonMutate {
    pokemon: number;
    note?: string;
  }
