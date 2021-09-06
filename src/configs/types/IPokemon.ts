import pokemons from '../../assets/pokemons.json'

export type IPokemonType = typeof pokemons[0]

export interface IPokemon extends IPokemonType {
  note?: string;
}

export interface IPokemonMutate {
  pokemon: number;
  note?: string;
}

export interface IUserPokemons {
  pokemons: Array<IPokemon>;
}

export interface IUserPokemonsMutate {
  pokemons: Array<IPokemonMutate>;
}
