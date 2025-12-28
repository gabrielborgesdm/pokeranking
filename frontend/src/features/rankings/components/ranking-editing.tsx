"use client";

import { memo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  PokemonDropzone,
  PokemonBoxesWithFilters,
  PickerDropzoneLayout,
} from "@/features/pokemon-picker";
import { useRankingEditing } from "../hooks/use-ranking-editing";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto, RankingResponseDto } from "@pokeranking/api-client";

interface RankingEditingProps {
  /** Ranking data */
  ranking: RankingResponseDto;
  /** Pokemon list */
  pokemon: PokemonResponseDto[];
  /** Called when pokemon list changes */
  setPokemon: (pokemon: PokemonResponseDto[]) => void;
  /** Map of position (1-based) to zone color */
  positionColors: Map<number, string>;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Called when save button is clicked */
  onSave?: () => void;
  /** Called when discard is confirmed */
  onDiscard?: () => void;
}

/**
 * RankingEditing - Editing view of a ranking with drag/drop functionality
 *
 * Contains DndContext and the picker/dropzone layout for managing Pokemon.
 */
export const RankingEditing = memo(function RankingEditing({
  pokemon,
  setPokemon,
  positionColors,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onDiscard,
}: RankingEditingProps) {
  const { sensors, filteredOutIds, disabledIds } = useRankingEditing(pokemon);
  const { isMobile } = useScreenSize();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Mobile: use smaller heights that fit within layout constraints (45dvh dropzone, 40dvh picker)
  // Desktop: use full 85vh for both
  const dropzoneHeight = isMobile ? "calc(45dvh - 40px)" : "85vh";
  const pickerHeight = isMobile ? "calc(40dvh - 40px)" : "85vh";

  return (
    <DndContext sensors={sensors}>
      <PickerDropzoneLayout
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={onSave}
        onDiscard={onDiscard}
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => setFiltersOpen(true)}
        dropzone={
          <PokemonDropzone
            id="ranking-pokemon"
            pokemon={pokemon}
            onChange={setPokemon}
            positionColors={positionColors}
            maxColumns={5}
            maxHeight={dropzoneHeight}
          />
        }
        picker={
          <PokemonBoxesWithFilters
            disabledIds={disabledIds}
            filteredOutIds={filteredOutIds}
            height={pickerHeight}
            filtersOpen={filtersOpen}
            onCloseFilters={() => setFiltersOpen(false)}
            onActiveFilterCountChange={setActiveFilterCount}
          />
        }
      />
    </DndContext>
  );
});
