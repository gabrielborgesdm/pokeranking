"use client";

import { memo } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  PokemonDropzone,
  PokemonBoxes,
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
}: RankingEditingProps) {
  const { sensors, filteredOutIds, disabledIds } = useRankingEditing(pokemon);

  return (
    <DndContext sensors={sensors}>
      <PickerDropzoneLayout
        className="h-[80vh] pt-4"
        dropzone={
          <PokemonDropzone
            id="ranking-pokemon"
            pokemon={pokemon}
            onChange={setPokemon}
            positionColors={positionColors}
            maxColumns={5}
            maxHeight="80vh"
            className="pl-20"
          />
        }
        picker={
          <PokemonBoxes
            disabledIds={disabledIds}
            filteredOutIds={filteredOutIds}
            height="75vh"
          />
        }
      />
    </DndContext>
  );
});
