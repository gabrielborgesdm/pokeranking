"use client";

import { memo, useState } from "react";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { PokemonPickerGrid } from "./pokemon-picker-grid";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";
import type { DraggablePokemonGalleryProps } from "../types";

export const DraggablePokemonGallery = memo(function DraggablePokemonGallery({
  pokemon,
  disabledIds = [],
  filteredOutIds = [],
  onDragStart,
  onDragEnd,
  className,
  maxColumns,
  minCardWidth,
  gap,
  rowHeight,
  height,
}: DraggablePokemonGalleryProps) {
  const { isMobile } = useScreenSize();
  const [activePokemon, setActivePokemon] = useState<PokemonResponseDto | null>(
    null
  );

  // Monitor drag events from parent DndContext
  useDndMonitor({
    onDragStart(event) {
      const poke = pokemon.find((p) => p._id === event.active.id);
      if (poke) {
        setActivePokemon(poke);
        onDragStart?.(event, poke);
      }
    },
    onDragEnd(event) {
      onDragEnd?.(event, activePokemon);
      setActivePokemon(null);
    },
    onDragCancel() {
      setActivePokemon(null);
    },
  });

  return (
    <div className={cn("w-full", className)}>
      <PokemonPickerGrid
        pokemon={pokemon}
        disabledIds={disabledIds}
        filteredOutIds={filteredOutIds}
        maxColumns={maxColumns}
        minCardWidth={minCardWidth}
        gap={gap}
        rowHeight={rowHeight}
        height={height}
      />

      {/* Drag overlay for visual feedback */}
      <DragOverlay dropAnimation={null}>
        {activePokemon && (
          <div className="cursor-grabbing animate-[lift_0.2s_ease-out_forwards]">
            <div className="relative">
              {/* Glow effect */}
              <div className={cn(
                "absolute bg-primary/30 blur-xl animate-pulse",
                isMobile ? "-inset-1 rounded-xl" : "-inset-2 rounded-2xl"
              )} />
              {/* Card with shadow */}
              <div className={cn(
                "relative shadow-2xl",
                isMobile ? "rounded-lg" : "rounded-xl"
              )}>
                <PokemonCard
                  name={activePokemon.name}
                  image={activePokemon.image}
                  types={activePokemon.types as PokemonType[]}
                  isCompact={isMobile}
                />
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </div>
  );
});
