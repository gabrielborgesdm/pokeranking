"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { X } from "lucide-react";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

interface SortablePokemonCardProps {
  pokemon: PokemonResponseDto;
  onRemove?: (id: string) => void;
  /** 1-based position of the pokemon in the ranking */
  position?: number;
  /** Zone color for the position badge */
  color?: string;
  /** Optional style for virtual positioning */
  style?: React.CSSProperties;
  /** Whether a drag operation is in progress (shows drop overlay) */
  isDropping?: boolean;
  /** Whether this card is highlighted (from search) */
  isHighlighted?: boolean;
}

export const SortablePokemonCard = memo(function SortablePokemonCard({
  pokemon,
  onRemove,
  position,
  color,
  style: virtualStyle,
  isDropping,
  isHighlighted,
}: SortablePokemonCardProps) {
  const { isSmall } = useScreenSize();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `dropzone-${pokemon._id}` });

  // Merge virtual positioning with dnd-kit transform
  const style: React.CSSProperties = {
    ...virtualStyle,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const types = pokemon.types as PokemonType[];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing touch-none",
        isDragging && "z-50 opacity-50"
      )}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(pokemon._id);
          }}
          className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <PokemonCard
        name={pokemon.name}
        image={pokemon.image}
        types={types}
        className="!min-w-0"
        position={position}
        positionColor={color}
        isDropping={isDropping}
        isCompact={isSmall}
        isHighlighted={isHighlighted}
      />
    </div>
  );
});
