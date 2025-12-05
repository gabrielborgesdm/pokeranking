"use client";

import { useRef, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { PokemonResponseDto } from "@pokeranking/api-client";

export interface VirtualizedPokemonGridProps {
  /** List of Pokemon to display */
  pokemon: PokemonResponseDto[];
  /** Render function for each Pokemon item */
  renderItem: (pokemon: PokemonResponseDto, index: number) => React.ReactNode;
  /** Maximum number of columns (caps responsive behavior) */
  maxColumns?: number;
  /** Minimum card width in pixels */
  minCardWidth?: number;
  /** Gap between cards in pixels */
  gap?: number;
  /** Row height for virtualization */
  rowHeight?: number;
  /** Height of the grid container (number for px, string for CSS value like "75vh") */
  height?: number | string;
  /** Optional class name for the container */
  className?: string;
  /** Padding at the top (for elements like remove buttons that overflow) */
  paddingTop?: number;
  /** Horizontal padding */
  paddingX?: number;
}

/**
 * A reusable virtualized grid component for displaying Pokemon.
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 */
export const VirtualizedPokemonGrid = memo(function VirtualizedPokemonGrid({
  pokemon,
  renderItem,
  maxColumns,
  minCardWidth,
  gap,
  rowHeight,
  height = POKEMON_PICKER_DEFAULTS.HEIGHT,
  className,
  paddingTop = 0,
  paddingX = 0,
}: VirtualizedPokemonGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { containerRef, config, rowCount } = useResponsiveGrid({
    maxColumns,
    minCardWidth,
    gap,
    rowHeight,
    itemCount: pokemon.length,
  });

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => config.rowHeight + config.gap,
    overscan: 2,
  });

  const totalHeight = rowVirtualizer.getTotalSize();
  const scrollHeight =
    typeof height === "string" ? height : Math.min(height, totalHeight);

  // Don't render until we have container width
  if (config.containerWidth === 0) {
    return <div ref={containerRef} className={cn("w-full", className)} />;
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div
        ref={scrollRef}
        style={{ maxHeight: scrollHeight }}
        className="overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          style={{
            height: totalHeight + paddingTop,
            width: "100%",
            position: "relative",
            paddingTop,
            paddingLeft: paddingX,
            paddingRight: paddingX,
          }}
        >
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
                  left: 0,
                  width: "100%",
                  height: virtualRow.size,
                  display: "flex",
                  justifyContent: "center",
                  gap: config.gap,
                }}
              >
                {rowPokemon.map((p, colIndex) => (
                  <div
                    key={p._id}
                    style={{
                      width: config.columnWidth,
                      flexShrink: 0,
                    }}
                  >
                    {renderItem(p, startIndex + colIndex)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
