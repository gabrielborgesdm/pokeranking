"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PokemonSearchProvider } from "@/features/pokemon-search/context/pokemon-search-context";
import { RankingEditing } from "@/features/rankings";
import { useRankPage } from "@/features/rankings/hooks/use-rank-page";
import { useScreenSize } from "@/providers/screen-size-provider";
import { LoadingFallback } from "@/components/loading-fallback";
import { Skeleton } from "@/components/ui/skeleton";

interface RankPageProps {
  params: Promise<{ id: string }>;
}

function RankPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      {/* Content skeleton - two panels */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-[60vh] flex-1 rounded-lg" />
        <Skeleton className="h-[60vh] flex-1 rounded-lg" />
      </div>
    </div>
  );
}

export default function RankPage({ params }: RankPageProps) {
  const { id } = use(params);
  const { isResizing } = useScreenSize();

  const {
    ranking,
    pokemon,
    setPokemon,
    positionColors,
    zones,
    hasUnsavedChanges,
    isSaving,
    handleSave,
    handleDiscard,
    isLoading,
    notFound: rankingNotFound,
    isUnauthorized,
  } = useRankPage({ id });

  if (rankingNotFound) {
    notFound();
  }

  // Unauthorized is handled inside the hook with redirect
  if (isUnauthorized || isLoading || !ranking) {
    return <RankPageSkeleton />;
  }

  if (isResizing) {
    return <LoadingFallback />;
  }

  return (
    <PokemonSearchProvider pokemon={pokemon} zones={zones}>
      <main>
        <RankingEditing
          ranking={ranking}
          pokemon={pokemon}
          setPokemon={setPokemon}
          positionColors={positionColors}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </main>
    </PokemonSearchProvider>
  );
}
