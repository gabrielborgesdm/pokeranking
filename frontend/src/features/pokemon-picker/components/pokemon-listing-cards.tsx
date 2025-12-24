"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { PokemonDetailsDialog } from "@/features/pokemon/components/pokemon-details-dialog";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { useScreenSize } from "@/providers/screen-size-provider";
import { EmptyPokemonCard } from "@/features/pokemon/empty-pokemon-card";
import { ZoneHeader } from "./zone-header";
import {
  groupPokemonByZones,
  buildVirtualItems,
  type Zone,
  type VirtualItem,
} from "../utils/zone-grouping";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

const ZONE_HEADER_HEIGHT = 48;
const ZONE_HEADER_HEIGHT_COMPACT = 36;

export interface PokemonListingCardsProps {
  /** Pokemon list to display */
  pokemon: PokemonResponseDto[];
  /** Zones for grouping pokemon with headers */
  zones?: Zone[];
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
 * When zones are provided, displays pokemon grouped by zones with headers.
 */
export const PokemonListingCards = memo(function PokemonListingCards({
  pokemon,
  zones,
  showPositions = true,
  className,
}: PokemonListingCardsProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSmall } = useScreenSize();
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(
    null
  );

  // Use responsive grid hook to calculate layout
  const { containerRef, config, rowCount } = useResponsiveGrid({
    itemCount: pokemon.length,
  });

  // Vertical gap between rows
  const rowGap = config.gap;

  // Zone header height based on screen size
  const headerHeight = isSmall
    ? ZONE_HEADER_HEIGHT_COMPACT
    : ZONE_HEADER_HEIGHT;

  // Group pokemon by zones and build virtual items
  const zoneGroups = useMemo(() => {
    if (!zones || zones.length === 0) return null;
    return groupPokemonByZones(pokemon, zones);
  }, [pokemon, zones]);

  const virtualItems = useMemo(() => {
    if (!zoneGroups) return null;
    return buildVirtualItems(zoneGroups, config.columnCount);
  }, [zoneGroups, config.columnCount]);

  // Extra gap before zone headers for better visual separation
  const zoneHeaderGap = isSmall ? 16 : 24;

  // Calculate item size based on type
  const getItemSize = (item: VirtualItem): number => {
    if (item.type === "header") {
      return headerHeight + rowGap + zoneHeaderGap;
    }
    return config.rowHeight + rowGap;
  };

  // Virtualizer for zone-grouped view
  const zoneVirtualizer = useVirtualizer({
    count: virtualItems?.length ?? 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      if (!virtualItems) return config.rowHeight + rowGap;
      return getItemSize(virtualItems[index]);
    },
    overscan: 3,
  });

  // Virtualizer for flat view (no zones)
  const flatVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => config.rowHeight + rowGap,
    overscan: 3,
  });

  // Use the appropriate virtualizer
  const rowVirtualizer = virtualItems ? zoneVirtualizer : flatVirtualizer;

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
    return <EmptyPokemonCard />;
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
        <div
          className="flex flex-col items-center"
          style={{
            height: totalHeight + paddingTop,
            width: "100%",
            position: "relative",
            justifyContent: "center",
            paddingTop,
          }}
        >
          {/* Zone-grouped rendering */}
          {virtualItems
            ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = virtualItems[virtualRow.index];

              if (item.type === "header") {
                // Extra width for lg screens to extend zone header to the right
                const lgExtraWidth = typeof window !== "undefined" && window.innerWidth >= 1024 ? 16 : 0;
                const headerWidth = gridContentWidth + lgExtraWidth;

                return (
                  <div
                    className="lg:ml-6"
                    key={`header-${item.zone.name}`}
                    style={{
                      position: "absolute",
                      top: virtualRow.start + paddingTop + zoneHeaderGap,
                      height: virtualRow.size - rowGap - zoneHeaderGap,
                      display: "flex",
                      width: headerWidth,
                      justifyContent: "left",
                    }}
                  >
                    <ZoneHeader
                      zone={item.zone}
                      pokemon={item.pokemon}
                      isCompact={isSmall}
                      width={headerWidth}
                    />
                  </div>
                );
              }

              // Pokemon row
              return (
                <div
                  key={`row-${item.startPosition}`}
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
                  {item.pokemon.map((p, colIndex) => {
                    const position = item.startPosition + colIndex;
                    const color = item.zoneColor;

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
            })
            : // Flat rendering (no zones)
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
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
