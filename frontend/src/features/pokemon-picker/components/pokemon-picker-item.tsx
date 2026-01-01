"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { Check } from "lucide-react";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";
import type { PokemonPickerMode } from "../types";

interface PokemonPickerItemProps {
  pokemon: PokemonResponseDto;
  mode: PokemonPickerMode;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
}

export const PokemonPickerItem = memo(function PokemonPickerItem({
  pokemon,
  mode,
  isSelected,
  isDisabled,
  onSelect,
}: PokemonPickerItemProps) {
  const { isSmall } = useScreenSize();

  // Only use draggable in drag mode
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: pokemon._id,
      data: { pokemon },
      disabled: mode !== "drag" || isDisabled,
    });

  // Don't apply transform when dragging - the DragOverlay handles the visual
  // This prevents the "ghost" effect of the original card following the cursor
  const dragTransform =
    transform && !isDragging
      ? {
          transform: CSS.Translate.toString(transform),
        }
      : undefined;

  const handleClick = () => {
    if (mode === "select" && !isDisabled) {
      onSelect?.(isSelected ? null : pokemon);
    }
  };

  // Cast types to PokemonType[] (the DTO uses string[] but they are valid PokemonType values)
  const types = pokemon.types as PokemonType[];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragTransform,
        zIndex: isDragging ? 1000 : undefined,
        position: isDragging ? "relative" : undefined,
      }}
      {...(mode === "drag" ? { ...attributes, ...listeners } : {})}
      className={cn(
        "relative",
        isDragging && "opacity-40 scale-95 transition-all duration-150",
        mode === "drag" &&
          !isDisabled &&
          "cursor-grab active:cursor-grabbing touch-manipulation",
        isDisabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {/* Selection checkmark indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20 bg-primary rounded-full p-1.5 shadow-lg">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <PokemonCard
        name={pokemon.name}
        image={pokemon.image}
        types={types}
        onClick={handleClick}
        isCompact={isSmall}
        className={cn(
          "!min-w-0", // Override min-width for grid layout
          isSelected && "ring-4 ring-primary shadow-lg shadow-primary/30",
          mode === "select" && !isDisabled && "cursor-pointer"
        )}
      />
    </div>
  );
});
