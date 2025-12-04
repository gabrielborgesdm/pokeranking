"use client";

import { memo, useCallback, useState } from "react";
import {
  useDroppable,
  DragOverlay,
  useDndMonitor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { SortablePokemonCard } from "./sortable-pokemon-card";
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
  /** Layout direction */
  layout?: "horizontal" | "grid";
  /** Number of columns for grid layout */
  columns?: number;
  /** Optional class name */
  className?: string;
  /** Min height of the dropzone */
  minHeight?: number;
  /** All available pokemon (for inserting new items) */
  allPokemon?: PokemonResponseDto[];
}

/**
 * PokemonDropzone - A droppable area that accepts Pokemon from PokemonPicker
 * and allows reordering of dropped Pokemon.
 *
 * Must be used inside a DndContext.
 */
export const PokemonDropzone = memo(function PokemonDropzone({
  id,
  pokemon,
  onChange,
  onRemove,
  placeholder = "Drag Pokemon here",
  layout = "grid",
  columns = 4,
  className,
  minHeight = 150,
  allPokemon = [],
}: PokemonDropzoneProps) {
  const [activeItem, setActiveItem] = useState<PokemonResponseDto | null>(null);
  const [overItemId, setOverItemId] = useState<string | null>(null);

  const { isOver, setNodeRef } = useDroppable({ id });

  // Monitor drag events for internal sorting and external drops
  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      // Check if it's an internal item being dragged (for reordering)
      const draggedPokemon = pokemon.find((p) => p._id === event.active.id);
      if (draggedPokemon) {
        setActiveItem(draggedPokemon);
      }
    },
    onDragOver(event: DragOverEvent) {
      const { over } = event;
      // Track which item we're hovering over for insertion position
      if (over) {
        const isOverDropzone = over.id === id;
        const isOverItem = pokemon.some((p) => p._id === over.id);
        setOverItemId(isOverItem ? String(over.id) : isOverDropzone ? "dropzone" : null);
      } else {
        setOverItemId(null);
      }
    },
    onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveItem(null);
      setOverItemId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Check if this is a new item being dropped from outside
      const isExternalDrop = !pokemon.some((p) => p._id === activeId);
      const isDroppedOnDropzone = overId === id;
      const isDroppedOnItem = pokemon.some((p) => p._id === overId);

      if (isExternalDrop && (isDroppedOnDropzone || isDroppedOnItem)) {
        // Find the pokemon from allPokemon or active.data
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
      const oldIndex = pokemon.findIndex((p) => p._id === activeId);
      const newIndex = pokemon.findIndex((p) => p._id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(pokemon, oldIndex, newIndex);
        onChange(reordered);
      }
    },
    onDragCancel() {
      setActiveItem(null);
      setOverItemId(null);
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

  const sortableIds = pokemon.map((p) => p._id);

  return (
    <div
      ref={setNodeRef}
      style={{ minHeight }}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-4 transition-all duration-200",
        isOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted-foreground/30",
        className
      )}
    >
      {pokemon.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
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
        <SortableContext
          items={sortableIds}
          strategy={
            layout === "horizontal"
              ? horizontalListSortingStrategy
              : rectSortingStrategy
          }
        >
          <div
            className={cn(
              layout === "horizontal"
                ? "flex gap-4 overflow-x-auto pb-2"
                : "grid gap-4"
            )}
            style={
              layout === "grid"
                ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
                : undefined
            }
          >
            {pokemon.map((p) => (
              <div
                key={p._id}
                className={cn(
                  layout === "horizontal" && "flex-shrink-0 w-32",
                  layout === "grid" && "w-full"
                )}
              >
                <SortablePokemonCard pokemon={p} onRemove={handleRemove} />
              </div>
            ))}
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
