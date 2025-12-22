"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { MAX_GRID_CONTENT_WIDTH } from "@/features/pokemon-picker";
import {
  RankingEditing,
  RankingNavbar,
  useRankingPage
} from "@/features/rankings";
import { notFound } from "next/navigation";
import { use } from "react";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);

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

  return (
    <main>
      {isLoading || !ranking ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
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
      )}
    </main>
  );
}
