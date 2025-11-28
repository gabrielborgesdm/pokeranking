export interface PokemonFixtureData {
  name: string;
  image: string;
}

/**
 * Sample Pikachu pokemon for testing
 */
export const PIKACHU: PokemonFixtureData = {
  name: 'Pikachu',
  image: 'https://example.com/pikachu.png',
};

/**
 * Sample Charizard pokemon for testing
 */
export const CHARIZARD: PokemonFixtureData = {
  name: 'Charizard',
  image: 'https://example.com/charizard.png',
};

/**
 * Sample Bulbasaur pokemon for testing
 */
export const BULBASAUR: PokemonFixtureData = {
  name: 'Bulbasaur',
  image: 'https://example.com/bulbasaur.png',
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
    image: overrides.image || 'https://example.com/test-pokemon.png',
  };
}
