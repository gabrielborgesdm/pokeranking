"use client";

import { memo, useCallback, useState, useRef } from "react";
import {
  useDroppable,
  DragOverlay,
  useDndMonitor,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { SortablePokemonCard } from "./sortable-pokemon-card";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

export interface PokemonDropzoneProps {
  /** Unique ID for this dropzone */
  id: string;
  /** Pokemon currently in the dropzone */
  pokemon: PokemonResponseDto[];
  /** Called when pokemon are reordered or added */
  onChange: (pokemon: PokemonResponseDto[]) => void;
  /** Called when a pokemon is removed */
  onRemove?: (id: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Maximum number of columns for grid layout */
  maxColumns?: number;
  /** Optional class name */
  className?: string;
  /** Min height of the dropzone */
  minHeight?: number | string;
  /** Max height of the dropzone (enables scrolling). Accepts px number or CSS string like "80vh" */
  maxHeight?: number | string;
  /** All available pokemon (for inserting new items) */
  allPokemon?: PokemonResponseDto[];
  /** Map of position (1-based) to zone color */
  positionColors?: Map<number, string>;
  /** Whether to show position badges */
  showPositions?: boolean;
}

// Helper to extract pokemon ID from sortable ID (removes "dropzone-" prefix)
const extractPokemonId = (sortableId: string) => {
  const prefix = "dropzone-";
  return sortableId.startsWith(prefix) ? sortableId.slice(prefix.length) : sortableId;
};

/**
 * PokemonDropzone - A virtualized droppable area that accepts Pokemon from PokemonPicker
 * and allows reordering of dropped Pokemon.
 *
 * Uses TanStack Virtual for efficient rendering of large lists.
 * Must be used inside a DndContext.
 */
export const PokemonDropzone = memo(function PokemonDropzone({
  id,
  pokemon,
  onChange,
  onRemove,
  placeholder = "Drag Pokemon here",
  maxColumns = 4,
  className,
  minHeight = 150,
  maxHeight = POKEMON_PICKER_DEFAULTS.HEIGHT,
  allPokemon = [],
  positionColors,
  showPositions = true,
}: PokemonDropzoneProps) {
  const [activeItem, setActiveItem] = useState<PokemonResponseDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isOver, setNodeRef } = useDroppable({ id });

  // Use responsive grid hook to calculate layout
  const { containerRef, config, rowCount } = useResponsiveGrid({
    maxColumns,
    itemCount: pokemon.length,
  });

  // Vertical gap between rows (same as horizontal gap)
  const rowGap = config.gap;

  // Row virtualizer for efficient rendering
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => config.rowHeight + rowGap,
    overscan: 2, // Pre-render extra rows for smooth drag operations
  });

  // Monitor drag events for internal sorting and external drops
  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      // Check if it's an internal item being dragged (for reordering)
      const activeId = extractPokemonId(String(event.active.id));
      const draggedPokemon = pokemon.find((p) => p._id === activeId);
      if (draggedPokemon) {
        setActiveItem(draggedPokemon);
      }
    },
    onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveItem(null);

      if (!over) return;

      const rawActiveId = String(active.id);
      const rawOverId = String(over.id);
      const activeId = extractPokemonId(rawActiveId);
      const overId = extractPokemonId(rawOverId);

      // Check if this is an internal reorder (sortable IDs have "dropzone-" prefix)
      const isInternalDrag = rawActiveId.startsWith("dropzone-");
      const isDroppedOnDropzone = rawOverId === id;
      const isDroppedOnItem = pokemon.some((p) => p._id === overId);

      if (!isInternalDrag && (isDroppedOnDropzone || isDroppedOnItem)) {
        // External drop from picker - find the pokemon from allPokemon or active.data
        const newPokemon = allPokemon.find((p) => p._id === activeId) ||
          (active.data.current?.pokemon as PokemonResponseDto | undefined);

        if (newPokemon && !pokemon.some((p) => p._id === newPokemon._id)) {
          if (isDroppedOnItem) {
            // Insert at the position of the item we dropped on
            const insertIndex = pokemon.findIndex((p) => p._id === overId);
            const newList = [...pokemon];
            newList.splice(insertIndex, 0, newPokemon);
            onChange(newList);
          } else {
            // Append to end
            onChange([...pokemon, newPokemon]);
          }
        }
        return;
      }

      // Handle reordering within the dropzone
      if (isInternalDrag) {
        const oldIndex = pokemon.findIndex((p) => p._id === activeId);
        const newIndex = pokemon.findIndex((p) => p._id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(pokemon, oldIndex, newIndex);
          onChange(reordered);
        }
      }
    },
    onDragCancel() {
      setActiveItem(null);
    },
  });

  const handleRemove = useCallback(
    (itemId: string) => {
      if (onRemove) {
        onRemove(itemId);
      } else {
        // Default behavior: remove from list
        onChange(pokemon.filter((p) => p._id !== itemId));
      }
    },
    [pokemon, onChange, onRemove]
  );

  // Critical: SortableContext receives ALL IDs for proper drag calculations
  const sortableIds = pokemon.map((p) => `dropzone-${p._id}`);

  // Calculate total virtual height
  const totalHeight = rowVirtualizer.getTotalSize();
  // If maxHeight is a string (e.g., "80vh"), use it directly; otherwise calculate min
  const scrollHeight =
    typeof maxHeight === "string"
      ? maxHeight
      : Math.min(maxHeight, totalHeight);

  return (
    <div
      ref={(node) => {
        // Merge refs: droppable ref and container ref for responsive grid
        setNodeRef(node);
        if (containerRef.current !== node) {
          (containerRef as { current: HTMLDivElement | null }).current = node;
        }
      }}
      style={{ minHeight }}
      className={cn("relative", className)}
    >
      {pokemon.length === 0 ? (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200",
            isOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          )}
        >
          <p
            className={cn(
              "text-muted-foreground transition-colors",
              isOver && "text-primary font-medium"
            )}
          >
            {isOver ? "Release to drop!" : placeholder}
          </p>
        </div>
      ) : (
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          {/* Scroll container - hidden scrollbar */}
          <div
            ref={scrollRef}
            style={{ maxHeight: scrollHeight }}
            className="overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Virtual container with full height + padding for badge overflow */}
            <div
              style={{
                height: totalHeight,
                width: "100%",
                position: "relative",
                paddingTop: 16,
                paddingLeft: 16,
                paddingRight: 16,
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
                      top: virtualRow.start + 10, // 10 for the remove icon
                      left: 0,
                      width: "100%",
                      height: virtualRow.size,
                      display: "flex",
                      justifyContent: "center",
                      gap: config.gap,
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
                          <SortablePokemonCard
                            pokemon={p}
                            onRemove={handleRemove}
                            position={showPositions ? position : undefined}
                            color={color}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>
      )}

      {/* Drag overlay for sorting animation */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeItem && (
          <div className="scale-105 rotate-2 cursor-grabbing">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg" />
              <div className="relative shadow-2xl rounded-xl">
                <PokemonCard
                  name={activeItem.name}
                  image={activeItem.image}
                  types={activeItem.types as PokemonType[]}
                />
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </div>
  );
});
