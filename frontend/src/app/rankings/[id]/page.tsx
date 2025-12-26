"use client";

import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { PokemonListingCardsSkeleton } from "@/features/pokemon-picker/components/pokemon-listing-cards-skeleton";
import { MAX_GRID_CONTENT_WIDTH } from "@/features/pokemon-picker";
import {
  RankingActionBar,
  RankingEditing,
  RankingEditHeader,
  RankingHero,
  useRankingPage,
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
    zones,
    isOwner,
    isEditMode,
    handleEditClick,
    handleDiscardClick,
    handleSaveClick,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    notFound: rankingNotFound,
    // Like functionality
    likeCount,
    isLiked,
    toggleLike,
    // Hero data
    topPokemon,
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
      {isEditMode ? (
        // Edit mode: Simple header + editing component
        <div className="space-y-4">
          <RankingEditHeader
            title={ranking.title}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onDiscardClick={handleDiscardClick}
            onSaveClick={handleSaveClick}
            maxContentWidth={MAX_GRID_CONTENT_WIDTH}
          />
          <RankingEditing
            ranking={ranking}
            pokemon={pokemon}
            setPokemon={setPokemon}
            positionColors={positionColors}
          />
        </div>
      ) : (
        // View mode: Hero + Action bar + Pokemon listing
        <div className="space-y-4">
          <RankingHero
            title={ranking.title}
            username={ranking.user?.username ?? ""}
            topPokemon={topPokemon}
            pokemonCount={pokemon.length}
            theme={ranking.background}
            likeCount={likeCount}
            isLiked={isLiked}
            isOwner={isOwner}
            onLikeClick={toggleLike}
            maxContentWidth={MAX_GRID_CONTENT_WIDTH}
          />
          <RankingActionBar
            isOwner={isOwner}
            onEditClick={handleEditClick}
            maxContentWidth={MAX_GRID_CONTENT_WIDTH}
          />
          <PokemonListingCards
            key="listing-view"
            pokemon={pokemon}
            zones={zones}
            showPositions={true}
            className="py-8"
            isOwner={isOwner}
            onAddPokemon={handleEditClick}
          />
        </div>
      )}
    </main>
  );
}
