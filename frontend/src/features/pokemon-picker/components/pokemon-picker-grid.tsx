"use client";

import { memo, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { VirtualizedPokemonGrid } from "./virtualized-pokemon-grid";
import { PokemonPickerItem } from "./pokemon-picker-item";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonPickerMode } from "../types";

interface PokemonPickerGridProps {
  pokemon: PokemonResponseDto[];
  mode: PokemonPickerMode;
  selectedId?: string | null;
  disabledIds?: string[];
  filteredOutIds?: string[];
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
  maxColumns?: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
  height?: number | string;
  className?: string;
}

export const PokemonPickerGrid = memo(function PokemonPickerGrid({
  pokemon,
  mode,
  selectedId,
  disabledIds = [],
  filteredOutIds = [],
  onSelect,
  maxColumns,
  minCardWidth,
  gap,
  rowHeight,
  height = POKEMON_PICKER_DEFAULTS.HEIGHT,
  className,
}: PokemonPickerGridProps) {
  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);
  const filteredOutSet = useMemo(
    () => new Set(filteredOutIds),
    [filteredOutIds]
  );

  const visiblePokemon = useMemo(
    () => pokemon.filter((p) => !filteredOutSet.has(p._id)),
    [pokemon, filteredOutSet]
  );

  const renderItem = useCallback(
    (poke: PokemonResponseDto) => (
      <PokemonPickerItem
        pokemon={poke}
        mode={mode}
        isSelected={selectedId === poke._id}
        isDisabled={disabledSet.has(poke._id)}
        onSelect={onSelect}
      />
    ),
    [mode, selectedId, disabledSet, onSelect]
  );

  return (
    <VirtualizedPokemonGrid
      pokemon={visiblePokemon}
      renderItem={renderItem}
      maxColumns={maxColumns}
      minCardWidth={minCardWidth}
      gap={gap}
      rowHeight={rowHeight}
      height={height}
      className={cn("overflow-x-hidden", className)}
    />
  );
});
