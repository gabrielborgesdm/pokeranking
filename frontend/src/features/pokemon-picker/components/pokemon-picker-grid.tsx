"use client";

import { memo, useMemo, CSSProperties, ReactElement } from "react";
import { Grid, CellComponentProps } from "react-window";
import { cn } from "@/lib/utils";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { PokemonPickerItem } from "./pokemon-picker-item";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonPickerMode } from "../types";

interface PokemonPickerGridProps {
  pokemon: PokemonResponseDto[];
  mode: PokemonPickerMode;
  selectedId?: string | null;
  disabledIds?: string[];
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
  height?: number;
  className?: string;
}

interface CellData {
  pokemon: PokemonResponseDto[];
  columnCount: number;
  columnWidth: number;
  gap: number;
  mode: PokemonPickerMode;
  selectedId?: string | null;
  disabledIds: Set<string>;
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
}

type CellProps = CellComponentProps<CellData>;

function Cell({
  columnIndex,
  rowIndex,
  style,
  pokemon,
  columnCount,
  columnWidth,
  gap,
  mode,
  selectedId,
  disabledIds,
  onSelect,
}: CellProps): ReactElement {
  const index = rowIndex * columnCount + columnIndex;
  const poke = pokemon[index];

  // Return empty div for cells beyond the data length
  if (!poke) {
    return <div style={style} />;
  }

  const isSelected = selectedId === poke._id;
  const isDisabled = disabledIds.has(poke._id);

  // Outer wrapper for positioning (from react-window)
  // Inner content has gap spacing
  const halfGap = gap / 2;

  return (
    <div style={style}>
      <div
        style={{
          position: "absolute",
          top: halfGap,
          left: halfGap,
          right: halfGap,
          bottom: halfGap,
        }}
      >
        <PokemonPickerItem
          pokemon={poke}
          mode={mode}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onSelect={() => onSelect?.(isSelected ? null : poke)}
        />
      </div>
    </div>
  );
}

export const PokemonPickerGrid = memo(function PokemonPickerGrid({
  pokemon,
  mode,
  selectedId,
  disabledIds = [],
  onSelect,
  columns,
  minCardWidth,
  gap,
  rowHeight,
  height = POKEMON_PICKER_DEFAULTS.HEIGHT,
  className,
}: PokemonPickerGridProps) {
  const { containerRef, config, rowCount } = useResponsiveGrid({
    columns,
    minCardWidth,
    gap,
    rowHeight,
    itemCount: pokemon.length,
  });

  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);

  const cellProps: CellData = useMemo(
    () => ({
      pokemon,
      columnCount: config.columnCount,
      columnWidth: config.columnWidth,
      gap: config.gap,
      mode,
      selectedId,
      disabledIds: disabledSet,
      onSelect,
    }),
    [pokemon, config, mode, selectedId, disabledSet, onSelect]
  );

  // Account for gaps in total height calculation
  const totalHeight = rowCount * (config.rowHeight + config.gap);
  const gridHeight = Math.min(height, totalHeight);

  // Calculate width that fits exactly without horizontal overflow
  const columnWidthWithGap = config.columnWidth + config.gap;
  const gridWidth = columnWidthWithGap * config.columnCount;

  return (
    <div
      ref={containerRef}
      className={cn("w-full overflow-x-hidden", className)}
    >
      {config.containerWidth > 0 && (
        <div className="flex justify-center">
          <div style={{ width: gridWidth }}>
            <Grid
              cellComponent={Cell}
              cellProps={cellProps}
              columnCount={config.columnCount}
              columnWidth={columnWidthWithGap}
              rowCount={rowCount}
              rowHeight={config.rowHeight + config.gap}
              defaultHeight={gridHeight}
              defaultWidth={gridWidth}
              className="!overflow-x-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
});
