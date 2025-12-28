"use client";

import { memo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  PokemonDropzone,
  PokemonBoxesWithFilters,
  PickerDropzoneLayout,
} from "@/features/pokemon-picker";
import { useRankingEditing } from "../hooks/use-ranking-editing";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  return (
    <DndContext sensors={sensors}>
      <PickerDropzoneLayout
        className="h-[92vh] pt-4"
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
            maxHeight="80vh"
          />
        }
        picker={
          <PokemonBoxesWithFilters
            disabledIds={disabledIds}
            filteredOutIds={filteredOutIds}
            height="80vh"
            filtersOpen={filtersOpen}
            onCloseFilters={() => setFiltersOpen(false)}
            onActiveFilterCountChange={setActiveFilterCount}
          />
        }
      />
    </DndContext>
  );
});
