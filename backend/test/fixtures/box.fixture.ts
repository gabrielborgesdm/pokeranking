export interface BoxFixtureData {
  name: string;
  isPublic?: boolean;
  pokemon?: string[];
  user?: string;
  ownerUsername?: string;
}

/**
 * Sample public box for testing community features
 */
export const BOX_PUBLIC: BoxFixtureData = {
  name: 'Public Water Types',
  isPublic: true,
  pokemon: [],
};

/**
 * Sample private box for testing access control
 */
export const BOX_PRIVATE: BoxFixtureData = {
  name: 'Private Favorites',
  isPublic: false,
  pokemon: [],
};

/**
 * Sample box with pokemon for testing population
 */
export const BOX_WITH_POKEMON: BoxFixtureData = {
  name: 'My Collection',
  isPublic: false,
  pokemon: [], // Will be populated with actual pokemon IDs in tests
};

/**
 * Another public box for testing multiple community boxes
 */
export const BOX_PUBLIC_FIRE: BoxFixtureData = {
  name: 'Fire Types Collection',
  isPublic: true,
  pokemon: [],
};

/**
 * Factory function for creating custom box data
 * @param overrides - Partial box data to override defaults
 */
export function createBoxData(
  overrides: Partial<BoxFixtureData> = {},
): BoxFixtureData {
  return {
    name: overrides.name || 'Test Box',
    isPublic: overrides.isPublic !== undefined ? overrides.isPublic : false,
    pokemon: overrides.pokemon || [],
    ...overrides,
  };
}
