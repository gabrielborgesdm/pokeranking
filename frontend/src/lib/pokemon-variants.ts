export type PokemonTypeVariant =
  | "grass"
  | "water"
  | "fire"
  | "electric"
  | "special";

export const pokemonVariantClasses: Record<PokemonTypeVariant, string> = {
  grass: "gradient-type-grass",
  water: "gradient-type-water",
  fire: "gradient-type-fire",
  electric: "gradient-type-electric",
  special: "gradient-type-special",
};
