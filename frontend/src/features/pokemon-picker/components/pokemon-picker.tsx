"use client";

import { memo, useState } from "react";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { PokemonPickerGrid } from "./pokemon-picker-grid";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";
import type { PokemonPickerProps } from "../types";

/**
 * Internal component that uses useDndMonitor - must be inside DndContext
 */
const DragModePicker = memo(function DragModePicker({
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
}: Omit<PokemonPickerProps, "mode" | "selectedId" | "onSelect">) {
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
        mode="drag"
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
              <div className="absolute -inset-2 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
              {/* Card with shadow */}
              <div className="relative shadow-2xl rounded-xl">
                <PokemonCard
                  name={activePokemon.name}
                  image={activePokemon.image}
                  types={activePokemon.types as PokemonType[]}
                />
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </div>
  );
});

/**
 * PokemonPicker component for selecting or dragging Pokemon.
 *
 * IMPORTANT: When using mode="drag", you must wrap this component with a DndContext
 * from @dnd-kit/core. The DndContext should be provided by the parent component
 * so that drop targets outside this component can receive the dragged items.
 *
 * Example:
 * ```tsx
 * <DndContext onDragEnd={handleDragEnd}>
 *   <DropZone />
 *   <PokemonPicker pokemon={list} mode="drag" />
 * </DndContext>
 * ```
 */
export const PokemonPicker = memo(function PokemonPicker({
  pokemon,
  mode,
  selectedId,
  disabledIds = [],
  filteredOutIds = [],
  onSelect,
  onDragStart,
  onDragEnd,
  className,
  maxColumns,
  minCardWidth,
  gap,
  rowHeight,
  height,
}: PokemonPickerProps) {
  // Use separate component for drag mode to isolate useDndMonitor hook
  if (mode === "drag") {
    return (
      <DragModePicker
        pokemon={pokemon}
        disabledIds={disabledIds}
        filteredOutIds={filteredOutIds}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={className}
        maxColumns={maxColumns}
        minCardWidth={minCardWidth}
        gap={gap}
        rowHeight={rowHeight}
        height={height}
      />
    );
  }

  // Select mode - no DndContext needed
  return (
    <div className={cn("w-full", className)}>
      <PokemonPickerGrid
        pokemon={pokemon}
        mode="select"
        selectedId={selectedId}
        disabledIds={disabledIds}
        filteredOutIds={filteredOutIds}
        onSelect={onSelect}
        maxColumns={maxColumns}
        minCardWidth={minCardWidth}
        gap={gap}
        rowHeight={rowHeight}
        height={height}
      />
    </div>
  );
});
