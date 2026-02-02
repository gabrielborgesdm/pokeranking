"use client";

import { PokemonSearchProvider } from "@/features/pokemon-search/context/pokemon-search-context";
import { RankingEditing } from "@/features/rankings";
import { useRankPage } from "@/features/rankings/hooks/use-rank-page";
import { notFound } from "next/navigation";
import { use } from "react";
import { RankPageSkeleton } from "./rank-page-skeleton";

interface RankPageProps {
  params: Promise<{ id: string }>;
}

export default function RankPage({ params }: RankPageProps) {
  const { id } = use(params);


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

  return (
    <PokemonSearchProvider pokemon={pokemon} zones={zones}>

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

    </PokemonSearchProvider>
  );
}
