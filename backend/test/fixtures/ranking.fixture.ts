import { ZoneDto } from '../../src/rankings/dto/zone.dto';

export interface RankingFixtureData {
  title: string;
  user?: string;
  pokemon?: string[];
  zones?: ZoneDto[];
}

export const GEN1_RANKING: RankingFixtureData = {
  title: 'Gen 1 Favorites',
  zones: [
    { name: 'S-Tier', interval: [1, 3], color: '#FF5733' },
    { name: 'A-Tier', interval: [4, 8], color: '#FFC300' },
    { name: 'B-Tier', interval: [9, 15], color: '#DAF7A6' },
  ],
};

export const COMPETITIVE_RANKING: RankingFixtureData = {
  title: 'Competitive Tier List',
  zones: [
    { name: 'OU', interval: [1, 5], color: '#900C3F' },
    { name: 'UU', interval: [6, 10], color: '#C70039' },
  ],
};

export function createRankingData(
  overrides: Partial<RankingFixtureData> = {},
): RankingFixtureData {
  return {
    title: overrides.title || 'Test Ranking',
    pokemon: overrides.pokemon || [],
    zones: overrides.zones || [],
    ...overrides,
  };
}
