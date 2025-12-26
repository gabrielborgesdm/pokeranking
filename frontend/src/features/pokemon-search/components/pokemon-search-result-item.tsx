"use client";

import { memo } from "react";
import { PokemonImage } from "@/components/pokemon-image";
import type { PokemonSearchResult } from "../types";

interface PokemonSearchResultItemProps {
  result: PokemonSearchResult;
  onClick: () => void;
}

/**
 * Single search result item showing Pokemon image, name, tier badge, and position
 */
export const PokemonSearchResultItem = memo(function PokemonSearchResultItem({
  result,
  onClick,
}: PokemonSearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
    >
      {/* Pokemon image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <PokemonImage
          src={result.pokemon.image}
          alt={result.pokemon.name}
          fill
          className="object-contain"
          sizes="48px"
        />
      </div>

      {/* Name and tier info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{result.pokemon.name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {result.zoneName && (
            <span
              className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
              style={{ backgroundColor: result.zoneColor }}
            >
              {result.zoneName}
            </span>
          )}
          <span className="font-mono">#{result.position}</span>
        </div>
      </div>
    </button>
  );
});
