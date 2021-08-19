import pokemons from '../../assets/pokemons.json'

export type IPokemonType = typeof pokemons[0]

interface IPokemon {
  pokemon: IPokemonType;
  note?: string;
}

interface IPokemonMutate {
  pokemon: number;
  note?: string;
}

export interface IUserPokemons {
  pokemons: Array<IPokemon>;
}

export interface IUserPokemonsMutate {
  pokemons: Array<IPokemonMutate>;
}
