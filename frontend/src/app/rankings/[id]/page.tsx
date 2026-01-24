"use client";

import { LoadingFallback } from "@/components/loading-fallback";
import { PokemonListingCards } from "@/features/pokemon-picker/components/pokemon-listing-cards";
import { PokemonListingCardsSkeleton } from "@/features/pokemon-picker/components/pokemon-listing-cards-skeleton";
import { useResponsiveGrid } from "@/features/pokemon-picker/hooks/use-responsive-grid";
import type { Zone } from "@/features/pokemon-picker/utils/zone-grouping";
import { PokemonSearchProvider } from "@/features/pokemon-search/context/pokemon-search-context";
import {
  RankingActionBar,
  RankingHero,
  useRankingViewPage,
} from "@/features/rankings";
import { useIsAuthenticated } from "@/features/users/hooks/use-is-authenticated";
import { useAnalytics } from "@/hooks/use-analytics";
import { routes } from "@/lib/routes";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto, RankingResponseDto } from "@pokeranking/api-client";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

interface RankingPageContentProps {
  ranking: RankingResponseDto;
  pokemon: PokemonResponseDto[];
  zones: Zone[];
  isOwner: boolean;
  topPokemon: { name: string; image: string; id?: string } | null;
  likeCount: number;
  isLiked: boolean;
  toggleLike: () => void;
  isSearchEnabled: boolean;
  onAddPokemon: () => void;
  id: string;
}

function RankingPageContent({
  ranking,
  pokemon,
  zones,
  isOwner,
  topPokemon,
  likeCount,
  isLiked,
  toggleLike,
  isSearchEnabled,
  onAddPokemon,
  id,
}: RankingPageContentProps) {
  // Use responsive grid to get the actual content width based on viewport
  const { containerRef, gridContentWidth } = useResponsiveGrid({
    itemCount: pokemon.length,
  });

  const isAuthenticated = useIsAuthenticated();

  // Only apply maxWidth once measured (gridContentWidth > 0)
  const maxContentWidth = gridContentWidth > 0 ? gridContentWidth : undefined;

  return (
    <main ref={containerRef}>
      <RankingHero
        title={ranking.title}
        username={ranking.user?.username ?? ""}
        topPokemon={topPokemon}
        pokemonCount={pokemon.length}
        theme={ranking.background}
        likeCount={likeCount}
        isLiked={isLiked}
        isOwner={isOwner}
        isAuthenticated={isAuthenticated}
        onLikeClick={toggleLike}
        maxContentWidth={maxContentWidth}
      />
      <RankingActionBar
        rankingId={id}
        rankingTitle={ranking.title}
        pokemon={pokemon}
        isOwner={isOwner}
        maxContentWidth={maxContentWidth}
        isSearchEnabled={isSearchEnabled}
      />
      <PokemonListingCards
        key="listing-view"
        pokemon={pokemon}
        zones={zones}
        showPositions={true}
        isOwner={isOwner}
        onAddPokemon={onAddPokemon}
      />
    </main>
  );
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);
  const { isResizing } = useScreenSize();
  const router = useRouter();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();

  const { trackRankingView } = useAnalytics();
  const hasTrackedRef = useRef(false);

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

  // Track ranking view once when ranking data is loaded
  useEffect(() => {
    if (ranking && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackRankingView(id, ranking.title);
    }
  }, [ranking, id, trackRankingView]);

  const handleAddPokemon = useCallback(() => {
    router.push(routes.rankingRank(id));
  }, [router, id]);

  useEffect(() => {
    if (rankingNotFound) {
      toast.error(t("toast.rankingNotFound"));
      router.push(routes.home);
    }
  }, [rankingNotFound, router, t]);


  if (!isLoading || !ranking || rankingNotFound) {
    return <PokemonListingCardsSkeleton count={15} isCompact={false} />;
  }

  // mobile has some issue with this fallback, so we skip it there
  if (isResizing && !isMobile) {
    return <LoadingFallback />;
  }

  const isSearchEnabled = pokemon.length > 0;

  return (
    <PokemonSearchProvider pokemon={pokemon} zones={zones}>
      <RankingPageContent
        ranking={ranking}
        pokemon={pokemon}
        zones={zones}
        isOwner={isOwner}
        topPokemon={topPokemon}
        likeCount={likeCount}
        isLiked={isLiked}
        toggleLike={toggleLike}
        isSearchEnabled={isSearchEnabled}
        onAddPokemon={handleAddPokemon}
        id={id}
      />
    </PokemonSearchProvider>
  );
}
