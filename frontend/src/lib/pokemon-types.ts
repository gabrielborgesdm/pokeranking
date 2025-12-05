// Re-export core types from shared package
export { PokemonTypes, POKEMON_TYPE_VALUES } from "@pokeranking/shared";
export type { PokemonType } from "@pokeranking/shared";

import type { PokemonType } from "@pokeranking/shared";

// Frontend-specific UI mappings
export const pokemonTypeImages: Record<PokemonType, string> = {
  Bug: "/types/bug.svg",
  Dark: "/types/dark.svg",
  Dragon: "/types/dragon.svg",
  Electric: "/types/electric.svg",
  Fairy: "/types/fairy.svg",
  Fighting: "/types/fighting.svg",
  Fire: "/types/fire.svg",
  Flying: "/types/flying.svg",
  Ghost: "/types/ghost.svg",
  Grass: "/types/grass.svg",
  Ground: "/types/ground.svg",
  Ice: "/types/ice.svg",
  Normal: "/types/normal.svg",
  Poison: "/types/poison.svg",
  Psychic: "/types/psychic.svg",
  Rock: "/types/rock.svg",
  Steel: "/types/steel.svg",
  Water: "/types/water.svg",
};

export const pokemonTypeGradients: Record<PokemonType, string> = {
  Bug: "gradient-type-bug",
  Dark: "gradient-type-dark",
  Dragon: "gradient-type-dragon",
  Electric: "gradient-type-electric",
  Fairy: "gradient-type-fairy",
  Fighting: "gradient-type-fighting",
  Fire: "gradient-type-fire",
  Flying: "gradient-type-flying",
  Ghost: "gradient-type-ghost",
  Grass: "gradient-type-grass",
  Ground: "gradient-type-ground",
  Ice: "gradient-type-ice",
  Normal: "gradient-type-normal",
  Poison: "gradient-type-poison",
  Psychic: "gradient-type-psychic",
  Rock: "gradient-type-rock",
  Steel: "gradient-type-steel",
  Water: "gradient-type-water",
};

export const pokemonTypeColors: Record<PokemonType, string> = {
  Bug: "#91C12F",
  Dark: "#5A5465",
  Dragon: "#0B6DC3",
  Electric: "#F4D23C",
  Fairy: "#EC8FE6",
  Fighting: "#CE416B",
  Fire: "#FF9D55",
  Flying: "#89AAE3",
  Ghost: "#5269AD",
  Grass: "#63BC5A",
  Ground: "#D97845",
  Ice: "#73CEC0",
  Normal: "#919AA2",
  Poison: "#B567CE",
  Psychic: "#FA7179",
  Rock: "#C5B78C",
  Steel: "#5A8EA2",
  Water: "#5090D6",
};

export function getPokemonTypeColor(type: PokemonType): string {
  return pokemonTypeColors[type] ?? "#919AA2";
}

export function getRandomType(types: PokemonType[]): PokemonType | null {
  if (types.length === 0) return null;
  return types[Math.floor(Math.random() * types.length)];
}

export function getCardGradient(types: PokemonType[]): string {
  if (types.length === 0) return "";
  const type = types.length === 1 ? types[0] : getRandomType(types);
  return type ? pokemonTypeGradients[type] : "";
}
