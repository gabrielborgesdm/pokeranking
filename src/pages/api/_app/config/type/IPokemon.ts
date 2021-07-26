import pokemons from '../../../../../assets/pokemons.json'

export type IPokemon = typeof pokemons[0]

export interface IUserPokemon {
  pokemon: IPokemon;
  note?: string;
}

export interface IUserPokemonMutate {
  pokemon: number;
  note?: string;
}
