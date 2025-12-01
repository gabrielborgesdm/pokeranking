export interface PokemonFixtureData {
  name: string;
  image: string;
}

/**
 * Sample Pikachu pokemon for testing (public image format)
 */
export const PIKACHU: PokemonFixtureData = {
  name: 'Pikachu',
  image: 'pikachu.png',
};

/**
 * Sample Charizard pokemon for testing (hosted image format)
 */
export const CHARIZARD: PokemonFixtureData = {
  name: 'Charizard',
  image: 'https://res.cloudinary.com/pokemon/charizard.png',
};

/**
 * Sample Bulbasaur pokemon for testing (public image format)
 */
export const BULBASAUR: PokemonFixtureData = {
  name: 'Bulbasaur',
  image: 'bulbasaur.webp',
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
  };
}
