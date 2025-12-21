"use client";

import { memo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

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
      <div
        ref={containerRef}
        className={cn(
          "flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 min-h-[200px]",
          className
        )}
      >
        <p className="text-muted-foreground">{t("rankingView.emptyRanking")}</p>
      </div>
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
                  marginRight: "20px",
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
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
