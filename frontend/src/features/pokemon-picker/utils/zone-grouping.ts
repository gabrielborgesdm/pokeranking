import type {
  PokemonResponseDto,
  ZoneResponseDto,
} from "@pokeranking/api-client";

export type Zone = ZoneResponseDto;

export interface ZoneGroup {
  zone: Zone;
  pokemon: PokemonResponseDto[];
  startPosition: number;
}

export type VirtualItem =
  | { type: "header"; zone: Zone; pokemon: PokemonResponseDto[] }
  | {
      type: "row";
      pokemon: PokemonResponseDto[];
      startPosition: number;
      zoneColor: string;
    };

/**
 * Groups pokemon by zone intervals.
 * Pokemon are assigned to zones based on their 1-based position.
 */
export function groupPokemonByZones(
  pokemon: PokemonResponseDto[],
  zones: Zone[]
): ZoneGroup[] {
  const groups: ZoneGroup[] = [];

  for (const zone of zones) {
    const start = zone.interval[0];
    const end = zone.interval[1];
    const effectiveEnd = end ?? pokemon.length;

    // Get pokemon that fall within this zone's interval (1-based positions)
    // start and end are 1-based, array indices are 0-based
    const startIndex = start - 1;
    const endIndex = Math.min(effectiveEnd, pokemon.length);
    const zonePokemon = pokemon.slice(startIndex, endIndex);

    if (zonePokemon.length > 0) {
      groups.push({
        zone,
        pokemon: zonePokemon,
        startPosition: start,
      });
    }
  }

  return groups;
}

/**
 * Builds a list of virtual items (headers + rows) for virtualization.
 * Position numbers continue globally across all zones (not reset per zone).
 */
export function buildVirtualItems(
  zoneGroups: ZoneGroup[],
  columnCount: number
): VirtualItem[] {
  const items: VirtualItem[] = [];

  for (const group of zoneGroups) {
    // Add zone header
    items.push({
      type: "header",
      zone: group.zone,
      pokemon: group.pokemon,
    });

    // Add rows for this zone's pokemon
    const rowCount = Math.ceil(group.pokemon.length / columnCount);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowPokemon = group.pokemon.slice(
        rowIndex * columnCount,
        (rowIndex + 1) * columnCount
      );
      // Global position continues from zone's start position
      const startPosition = group.startPosition + rowIndex * columnCount;

      items.push({
        type: "row",
        pokemon: rowPokemon,
        startPosition,
        zoneColor: group.zone.color,
      });
    }
  }

  return items;
}
