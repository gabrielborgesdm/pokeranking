"use client";

import { memo } from "react";
import { PokemonListingCards } from "@/features/pokemon-picker";
import type { PokemonResponseDto, RankingResponseDto } from "@pokeranking/api-client";

interface RankingListingProps {
  /** Ranking data */
  ranking: RankingResponseDto;
  /** Pokemon list to display */
  pokemon: PokemonResponseDto[];
  /** Map of position (1-based) to zone color */
  positionColors: Map<number, string>;
}

/**
 * RankingListing - Read-only view of a ranking
 *
 * Displays Pokemon in a simple virtualized grid without drag/drop functionality.
 */
export const RankingListing = memo(function RankingListing({
  pokemon,
  positionColors,
}: RankingListingProps) {
  return (
    <PokemonListingCards
      pokemon={pokemon}
      positionColors={positionColors}
      showPositions
    />
  );
});
