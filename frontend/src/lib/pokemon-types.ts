// Re-export core types from shared package
export { PokemonTypes, POKEMON_TYPE_VALUES } from "@pokeranking/shared";
export type { PokemonType } from "@pokeranking/shared";

import type { PokemonType } from "@pokeranking/shared";

// Frontend-specific UI mappings
export const pokemonTypeImages: Record<PokemonType, string> = {
  Bug: "/types/Bug@2x.png",
  Dark: "/types/Dark@2x.png",
  Dragon: "/types/Dragon@2x.png",
  Electric: "/types/Electric@2x.png",
  Fairy: "/types/Fairy@2x.png",
  Fighting: "/types/Fighting@2x.png",
  Fire: "/types/Fire@2x.png",
  Flying: "/types/Flying@2x.png",
  Ghost: "/types/Ghost@2x.png",
  Grass: "/types/Grass@2x.png",
  Ground: "/types/Ground@2x.png",
  Ice: "/types/Ice@2x.png",
  Normal: "/types/Normal@2x.png",
  Poison: "/types/Poison@2x.png",
  Psychic: "/types/Psychic@2x.png",
  Rock: "/types/Rock@2x.png",
  Steel: "/types/Steel@2x.png",
  Water: "/types/Water@2x.png",
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
