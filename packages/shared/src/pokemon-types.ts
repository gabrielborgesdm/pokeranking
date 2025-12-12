export const POKEMON_TYPE_VALUES = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
] as const;

export type PokemonType = (typeof POKEMON_TYPE_VALUES)[number];

/** @deprecated Use POKEMON_TYPE_VALUES directly */
export const PokemonTypes = Object.fromEntries(
  POKEMON_TYPE_VALUES.map((t) => [t, t])
) as Record<PokemonType, PokemonType>;

export interface PokemonStats {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
}
