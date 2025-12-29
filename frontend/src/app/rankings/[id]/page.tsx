"use client";

import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { PokemonListingCardsSkeleton } from "@/features/pokemon-picker/components/pokemon-listing-cards-skeleton";
import { MAX_GRID_CONTENT_WIDTH } from "@/features/pokemon-picker";
import {
  RankingActionBar,
  RankingHero,
  useRankingViewPage,
} from "@/features/rankings";
import { PokemonSearchProvider } from "@/features/pokemon-search/context/pokemon-search-context";
import { useScreenSize } from "@/providers/screen-size-provider";
import { LoadingFallback } from "@/components/loading-fallback";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { use, useCallback } from "react";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);
  const { isResizing } = useScreenSize();
  const router = useRouter();

  const {
    ranking,
    pokemon,
    zones,
    isOwner,
    isLoading,
    notFound: rankingNotFound,
    likeCount,
    isLiked,
    toggleLike,
    topPokemon,
  } = useRankingViewPage({ id });

  const handleAddPokemon = useCallback(() => {
    router.push(routes.rankingRank(id));
  }, [router, id]);

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
          maxContentWidth={MAX_GRID_CONTENT_WIDTH}
          isSearchEnabled={isSearchEnabled}
        />
        <PokemonListingCards
          key="listing-view"
          pokemon={pokemon}
          zones={zones}
          showPositions={true}
          isOwner={isOwner}
          onAddPokemon={handleAddPokemon}
        />
      </main>
    </PokemonSearchProvider>
  );
}
