import { IModel } from './IModel'
import { IUser } from './IUser'

interface IPokemonAttributes {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

interface IPokemon {
  id: string,
  name: object,
  types: Array<string>,
  image: string
  attributes: IPokemonAttributes,
}

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
