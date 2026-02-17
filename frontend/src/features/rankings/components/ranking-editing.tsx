"use client";

import { memo } from "react";
import { useRankingEditing } from "../hooks/use-ranking-editing";
import { useRankingEditDesktopLayout } from "../hooks/use-ranking-edit-desktop-layout";
import { DesktopRankingEditing } from "./desktop/desktop-ranking-editing";
import { MobileRankingEditing } from "./mobile/mobile-ranking-editing";
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
 * Switches between mobile and desktop implementations based on screen size.
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
  const { useMobileLayout } = useRankingEditDesktopLayout();
  const { sensors, filteredOutIds, disabledIds } = useRankingEditing(
    pokemon,
    useMobileLayout
  );

  const commonProps = {
    pokemon,
    setPokemon,
    positionColors,
    hasUnsavedChanges,
    isSaving,
    onSave,
    onDiscard,
    sensors,
    filteredOutIds,
    disabledIds,
  };

  if (useMobileLayout) {
    return <MobileRankingEditing {...commonProps} />;
  }

  return <DesktopRankingEditing {...commonProps} />;
});
