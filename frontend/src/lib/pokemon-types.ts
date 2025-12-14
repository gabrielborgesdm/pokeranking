// Re-export core types from shared package
export { PokemonTypes, POKEMON_TYPE_VALUES } from "@pokeranking/shared";
export type { PokemonType } from "@pokeranking/shared";

import type { PokemonType } from "@pokeranking/shared";

// Frontend-specific UI mappings
export const pokemonTypeImages: Record<PokemonType, string> = {
  bug: "/types/bug.svg",
  dark: "/types/dark.svg",
  dragon: "/types/dragon.svg",
  electric: "/types/electric.svg",
  fairy: "/types/fairy.svg",
  fighting: "/types/fighting.svg",
  fire: "/types/fire.svg",
  flying: "/types/flying.svg",
  ghost: "/types/ghost.svg",
  grass: "/types/grass.svg",
  ground: "/types/ground.svg",
  ice: "/types/ice.svg",
  normal: "/types/normal.svg",
  poison: "/types/poison.svg",
  psychic: "/types/psychic.svg",
  rock: "/types/rock.svg",
  steel: "/types/steel.svg",
  water: "/types/water.svg",
};

export const pokemonTypeGradients: Record<PokemonType, string> = {
  bug: "gradient-type-bug",
  dark: "gradient-type-dark",
  dragon: "gradient-type-dragon",
  electric: "gradient-type-electric",
  fairy: "gradient-type-fairy",
  fighting: "gradient-type-fighting",
  fire: "gradient-type-fire",
  flying: "gradient-type-flying",
  ghost: "gradient-type-ghost",
  grass: "gradient-type-grass",
  ground: "gradient-type-ground",
  ice: "gradient-type-ice",
  normal: "gradient-type-normal",
  poison: "gradient-type-poison",
  psychic: "gradient-type-psychic",
  rock: "gradient-type-rock",
  steel: "gradient-type-steel",
  water: "gradient-type-water",
};

export const pokemonTypeColors: Record<PokemonType, string> = {
  bug: "#91C12F",
  dark: "#5A5465",
  dragon: "#0B6DC3",
  electric: "#F4D23C",
  fairy: "#EC8FE6",
  fighting: "#CE416B",
  fire: "#FF9D55",
  flying: "#89AAE3",
  ghost: "#5269AD",
  grass: "#63BC5A",
  ground: "#D97845",
  ice: "#73CEC0",
  normal: "#919AA2",
  poison: "#B567CE",
  psychic: "#FA7179",
  rock: "#C5B78C",
  steel: "#5A8EA2",
  water: "#5090D6",
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
