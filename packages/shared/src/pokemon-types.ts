export const PokemonTypes = {
  Bug: "Bug",
  Dark: "Dark",
  Dragon: "Dragon",
  Electric: "Electric",
  Fairy: "Fairy",
  Fighting: "Fighting",
  Fire: "Fire",
  Flying: "Flying",
  Ghost: "Ghost",
  Grass: "Grass",
  Ground: "Ground",
  Ice: "Ice",
  Normal: "Normal",
  Poison: "Poison",
  Psychic: "Psychic",
  Rock: "Rock",
  Steel: "Steel",
  Water: "Water",
} as const;

export type PokemonType = (typeof PokemonTypes)[keyof typeof PokemonTypes];

export const POKEMON_TYPE_VALUES = Object.values(PokemonTypes);

export interface PokemonStats {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
}
