import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

export interface ZoneStats {
  totalCount: number;
  generationCounts: Map<number, number>;
  typeCounts: Map<PokemonType, number>;
  topTypes: { type: PokemonType; count: number }[];
  topGenerations: { generation: number; count: number }[];
}

/**
 * Calculate statistics for a list of pokemon in a zone
 */
export function calculateZoneStats(pokemon: PokemonResponseDto[]): ZoneStats {
  const generationCounts = new Map<number, number>();
  const typeCounts = new Map<PokemonType, number>();

  for (const p of pokemon) {
    // Count generations
    if (p.generation) {
      generationCounts.set(
        p.generation,
        (generationCounts.get(p.generation) ?? 0) + 1
      );
    }

    // Count types (each pokemon can have multiple types)
    for (const type of p.types ?? []) {
      typeCounts.set(type as PokemonType, (typeCounts.get(type as PokemonType) ?? 0) + 1);
    }
  }

  // Sort types by count (descending)
  const topTypes = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Sort generations by count (descending)
  const topGenerations = Array.from(generationCounts.entries())
    .map(([generation, count]) => ({ generation, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCount: pokemon.length,
    generationCounts,
    typeCounts,
    topTypes,
    topGenerations,
  };
}
