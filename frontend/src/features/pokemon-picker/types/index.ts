import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export interface DraggablePokemonGalleryProps {
  /** List of Pokemon to display */
  pokemon: PokemonResponseDto[];
  /** IDs of Pokemon that should appear disabled/unavailable (grayed out but visible) */
  disabledIds?: string[];
  /** IDs of Pokemon that should be completely hidden from the picker */
  filteredOutIds?: string[];
  /** Callback when drag starts */
  onDragStart?: (event: DragStartEvent, pokemon: PokemonResponseDto) => void;
  /** Callback when drag ends */
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
  /** Height of the picker container (default: 600). Accepts number for px or string for CSS value like "75vh" */
  height?: number | string;
  /** Optional filter component to render above the cards */
  filterSlot?: React.ReactNode;
}

// Backwards compatibility - deprecated, use DraggablePokemonGalleryProps
export type PokemonPickerMode = "select" | "drag";
export type PokemonPickerProps = DraggablePokemonGalleryProps & {
  mode?: PokemonPickerMode;
  selectedId?: string | null;
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
};

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
