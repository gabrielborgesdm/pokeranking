import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export type PokemonPickerMode = "select" | "drag";

export interface PokemonPickerProps {
  /** List of Pokemon to display */
  pokemon: PokemonResponseDto[];
  /** Operating mode - select for single-select, drag for DnD */
  mode: PokemonPickerMode;
  /** Currently selected Pokemon ID (select mode only) */
  selectedId?: string | null;
  /** IDs of Pokemon that should appear disabled/unavailable */
  disabledIds?: string[];
  /** Callback when a Pokemon is selected (select mode) */
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
  /** Callback when drag starts (drag mode) */
  onDragStart?: (event: DragStartEvent, pokemon: PokemonResponseDto) => void;
  /** Callback when drag ends (drag mode) */
  onDragEnd?: (event: DragEndEvent, pokemon: PokemonResponseDto | null) => void;
  /** Optional class name for the container */
  className?: string;
  /** Maximum number of columns (caps responsive behavior) */
  maxColumns?: number;
  /** Minimum card width in pixels (default: 180, ignored if columns is set) */
  minCardWidth?: number;
  /** Gap between cards in pixels (default: 16) */
  gap?: number;
  /** Row height for virtualization (default: 280) */
  rowHeight?: number;
  /** Height of the picker container (default: 600) */
  height?: number;
}

export interface PokemonPickerItemProps {
  pokemon: PokemonResponseDto;
  mode: PokemonPickerMode;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect?: () => void;
}

export interface ResponsiveGridConfig {
  containerWidth: number;
  columnCount: number;
  columnWidth: number;
  rowHeight: number;
  gap: number;
}
