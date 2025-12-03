export const PokemonTypes = {
  Bug: "Bug",
  Dark: "Dark",
  Dragon: "Dragon",
  Electric: "Electric",
  Fire: "Fire",
  Flying: "Flying",
  Ghost: "Ghost",
  Grass: "Grass",
  Normal: "Normal",
  Poison: "Poison",
  Psychic: "Psychic",
  Rock: "Rock",
} as const;

export type PokemonType = (typeof PokemonTypes)[keyof typeof PokemonTypes];

export const pokemonTypeImages: Record<PokemonType, string> = {
  Bug: "/types/Bug@2x.png",
  Dark: "/types/Dark@2x.png",
  Dragon: "/types/Dragon@2x.png",
  Electric: "/types/Electric@2x.png",
  Fire: "/types/Fire@2x.png",
  Flying: "/types/Flying@2x.png",
  Ghost: "/types/Ghost@2x.png",
  Grass: "/types/Grass@2x.png",
  Normal: "/types/Normal@2x.png",
  Poison: "/types/Poison@2x.png",
  Psychic: "/types/Psychic@2x.png",
  Rock: "/types/Rock@2x.png",
};

export const pokemonTypeGradients: Record<PokemonType, string> = {
  Bug: "gradient-type-bug",
  Dark: "gradient-type-dark",
  Dragon: "gradient-type-dragon",
  Electric: "gradient-type-electric",
  Fire: "gradient-type-fire",
  Flying: "gradient-type-flying",
  Ghost: "gradient-type-ghost",
  Grass: "gradient-type-grass",
  Normal: "gradient-type-normal",
  Poison: "gradient-type-poison",
  Psychic: "gradient-type-psychic",
  Rock: "gradient-type-rock",
};
