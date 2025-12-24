"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { PokemonDetailsDialog } from "@/features/pokemon/components/pokemon-details-dialog";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";
import { EmptyPokemonCard } from "@/features/pokemon/empty-pokemon-card";

export interface PokemonListingCardsProps {
  /** Pokemon list to display */
  pokemon: PokemonResponseDto[];
  /** Map of position (1-based) to zone color */
  positionColors?: Map<number, string>;
  /** Whether to show position badges */
  showPositions?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * PokemonListingCards - A virtualized read-only grid of Pokemon cards
 *
 * Used for displaying rankings in view mode (no drag/drop).
 * Uses TanStack Virtual for efficient rendering of large lists.
 */
export const PokemonListingCards = memo(function PokemonListingCards({
  pokemon,
  positionColors,
  showPositions = true,
  className,
}: PokemonListingCardsProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSmall } = useScreenSize();
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);

  // Use responsive grid hook to calculate layout
  const { containerRef, config, rowCount } = useResponsiveGrid({
    itemCount: pokemon.length,
  });

  // Vertical gap between rows
  const rowGap = config.gap;

  // Row virtualizer for efficient rendering
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => config.rowHeight + rowGap,
    overscan: 3,
  });

  // Re-measure virtualizer when grid config changes (resize)
  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, config.columnCount, config.rowHeight, config.gap]);

  // Calculate total virtual height
  const totalHeight = rowVirtualizer.getTotalSize();

  // Padding for position badge overflow
  const paddingTop = 16;

  // Calculate grid content width based on current config
  const gridContentWidth =
    config.columnCount * config.columnWidth +
    (config.columnCount - 1) * config.gap;

  if (pokemon.length === 0) {
    return (
      <EmptyPokemonCard />
    );
  }

  return (
    <div
      ref={(node) => {
        if (containerRef.current !== node) {
          (containerRef as { current: HTMLDivElement | null }).current = node;
        }
      }}
      className={cn("relative", className)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-hidden px-1 md:px-4"
      >
        {/* Virtual container with full height + padding for badge overflow */}
        <div className="flex flex-col items-center"
          style={{
            height: totalHeight + paddingTop,
            width: "100%",
            position: "relative",
            justifyContent: "center",
            paddingTop,
          }}
        >
          {/* Only render visible rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * config.columnCount;
            const rowPokemon = pokemon.slice(
              startIndex,
              startIndex + config.columnCount
            );

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: virtualRow.start + paddingTop,
                  height: virtualRow.size,
                  display: "flex",
                  width: gridContentWidth,
                  gap: config.gap,
                  justifyContent: "left",
                }}
              >
                {rowPokemon.map((p, colIndex) => {
                  const position = startIndex + colIndex + 1;
                  const color = positionColors?.get(position);

                  return (
                    <div
                      key={p._id}
                      style={{
                        width: config.columnWidth,
                        flexShrink: 0,
                      }}
                    >
                      <PokemonCard
                        name={p.name}
                        image={p.image}
                        types={p.types as PokemonType[]}
                        position={showPositions ? position : undefined}
                        positionColor={color}
                        isCompact={isSmall}
                        onClick={() => setSelectedPokemonId(p._id)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Single dialog instance for performance */}
      <PokemonDetailsDialog
        pokemonId={selectedPokemonId}
        open={!!selectedPokemonId}
        onOpenChange={(open) => !open && setSelectedPokemonId(null)}
      />
    </div>
  );
});
