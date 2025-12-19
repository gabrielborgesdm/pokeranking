"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RankingNavbar,
  RankingListing,
  RankingEditing,
} from "@/features/rankings";
import { useRankingPage } from "@/hooks/use-ranking-page";

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
        <div className="space-y-4">
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
          />

          {isEditMode ? (
            <RankingEditing
              ranking={ranking}
              pokemon={pokemon}
              setPokemon={setPokemon}
              positionColors={positionColors}
            />
          ) : (
            <RankingListing
              ranking={ranking}
              pokemon={pokemon}
              positionColors={positionColors}
            />
          )}
        </div>
      )}
    </main>
  );
}
