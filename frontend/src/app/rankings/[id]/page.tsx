"use client";

import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { PokemonListingCardsSkeleton } from "@/features/pokemon-picker/components/pokemon-listing-cards-skeleton";
import { MAX_GRID_CONTENT_WIDTH } from "@/features/pokemon-picker";
import {
  RankingEditing,
  RankingNavbar,
  useRankingPage
} from "@/features/rankings";
import { useScreenSize } from "@/providers/screen-size-provider";
import { LoadingFallback } from "@/components/loading-fallback";
import { notFound } from "next/navigation";
import { use } from "react";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);
  const { isResizing } = useScreenSize();

  const {
    ranking,
    pokemon,
    setPokemon,
    positionColors,
    isOwner,
    isEditMode,
    handleEditClick,
    handleDiscardClick,
    handleSaveClick,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    notFound: rankingNotFound,
  } = useRankingPage({ id });

  if (rankingNotFound) {
    notFound();
  }

  if (isLoading || !ranking) {
    return <PokemonListingCardsSkeleton count={15} isCompact={false} />;
  }

  if (isResizing) {
    return <LoadingFallback />;
  }

  return (
    <main>
      <div className="space-y-4">
        <RankingNavbar
          title={ranking.title}
          username={ranking.user?.username ?? ""}
          isOwner={isOwner}
          isEditMode={isEditMode}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onEditClick={handleEditClick}
          onDiscardClick={handleDiscardClick}
          onSaveClick={handleSaveClick}
          maxContentWidth={MAX_GRID_CONTENT_WIDTH}
        />

        {isEditMode ? (
          <RankingEditing
            ranking={ranking}
            pokemon={pokemon}
            setPokemon={setPokemon}
            positionColors={positionColors}
          />
        ) : (
          <PokemonListingCards
            pokemon={pokemon}
            positionColors={positionColors}
            showPositions={true}
            className='py-8'
          />
        )}
      </div>
    </main>
  );
}
