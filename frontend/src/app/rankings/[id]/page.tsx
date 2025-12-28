"use client";

import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { PokemonListingCardsSkeleton } from "@/features/pokemon-picker/components/pokemon-listing-cards-skeleton";
import { MAX_GRID_CONTENT_WIDTH } from "@/features/pokemon-picker";
import {
  RankingActionBar,
  RankingEditing,
  RankingHero,
  useRankingPage,
} from "@/features/rankings";
import { PokemonSearchProvider } from "@/features/pokemon-search/context/pokemon-search-context";
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

  const isSearchEnabled = pokemon.length > 0;

  return (
    <PokemonSearchProvider pokemon={pokemon} zones={zones}>
      <main>
        {isEditMode ? (
          // Edit mode: editing component with integrated controls
          <RankingEditing
            ranking={ranking}
            pokemon={pokemon}
            setPokemon={setPokemon}
            positionColors={positionColors}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onSave={handleSaveClick}
            onDiscard={handleDiscardClick}
          />
        ) : (
          // View mode: Hero + Action bar + Pokemon listing
          <div>
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
              rankingId={id}
              rankingTitle={ranking.title}
              pokemon={pokemon}
              isOwner={isOwner}
              onRankClick={handleEditClick}
              maxContentWidth={MAX_GRID_CONTENT_WIDTH}
              isSearchEnabled={isSearchEnabled}
            />
            <PokemonListingCards
              key="listing-view"
              pokemon={pokemon}
              zones={zones}
              showPositions={true}
              isOwner={isOwner}
              onAddPokemon={handleEditClick}
            />
          </div>
        )}
      </main>
    </PokemonSearchProvider>
  );
}
