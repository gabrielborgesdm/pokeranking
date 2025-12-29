"use client";

import { memo } from "react";
import { PokemonListingCards } from "@/features/pokemon-picker";
import type { PokemonResponseDto, ZoneResponseDto } from "@pokeranking/api-client";

interface RankingListingProps {
  /** Pokemon list to display */
  pokemon: PokemonResponseDto[];
  /** Zones for grouping pokemon with headers */
  zones: ZoneResponseDto[];
}

/**
 * RankingListing - Read-only view of a ranking
 *
 * Displays Pokemon in a simple virtualized grid without drag/drop functionality.
 */
export const RankingListing = memo(function RankingListing({
  pokemon,
  zones,
}: RankingListingProps) {
  return (
    <PokemonListingCards
      pokemon={pokemon}
      zones={zones}
      showPositions
    />
  );
});
