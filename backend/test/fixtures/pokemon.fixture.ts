import { PokemonType } from '@pokeranking/shared';

export interface PokemonFixtureData {
  name: string;
  image: string;
  types?: PokemonType[];
}

/**
 * Sample Pikachu pokemon for testing (public image format)
 */
export const PIKACHU: PokemonFixtureData = {
  name: 'Pikachu',
  image: 'pikachu.png',
  types: ['electric'],
};

/**
 * Sample Charizard pokemon for testing (hosted image format)
 */
export const CHARIZARD: PokemonFixtureData = {
  name: 'Charizard',
  image: 'https://res.cloudinary.com/pokemon/charizard.png',
  types: ['fire', 'flying'],
};

/**
 * Sample Bulbasaur pokemon for testing (public image format)
 */
export const BULBASAUR: PokemonFixtureData = {
  name: 'Bulbasaur',
  image: 'bulbasaur.webp',
  types: ['grass', 'poison'],
};

/**
 * Array of all pre-defined pokemon fixtures
 */
export const ALL_POKEMON = [PIKACHU, CHARIZARD, BULBASAUR];

/**
 * Factory function for creating custom pokemon data
 * @param overrides - Partial pokemon data to override defaults
 */
export function createPokemonData(
  overrides: Partial<PokemonFixtureData> = {},
): PokemonFixtureData {
  return {
    name: overrides.name || 'Test Pokemon',
    image: overrides.image || 'test-pokemon.png',
    types: overrides.types,
  };
}
