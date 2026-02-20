"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  RankingCard,
  RankingCardSkeleton,
  RankingsListFilters,
  useRankingsList,
} from "@/features/rankings";
import { Onboarding } from "@/components/onboarding";
import { OfflineBanner } from "@/components/offline-banner";
import { SimplePagination } from "@/components/pagination";
import { ErrorMessage } from "@/components/error-message";
import { AnimatedList } from "@/components/animated-list";
import { normalizePokemonImageSrc } from "@/lib/image-utils";
import { routes } from "@/lib/routes";
import { useAnalytics } from "@/hooks/use-analytics";

export default function RankingsListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const { trackPageView, trackPaginationChange, trackSortChange } = useAnalytics();
  const {
    currentPage,
    search,
    sortBy,
    order,
    rankings,
    total,
    totalPages,
    isLoading,
    error,
    refetch,
    handlePageChange,
    handleSearchChange,
    handleSortByChange,
    handleOrderChange,
    ITEMS_PER_PAGE,
  } = useRankingsList({ scrollTargetRef: gridRef });

  useEffect(() => {
    trackPageView("rankings", "Rankings List");
  }, [trackPageView]);

  const handleRankingClick = useCallback(
    (id: string) => {
      router.push(routes.ranking(id));
    },
    [router]
  );

  const handlePageChangeWithTracking = useCallback(
    (page: number) => {
      handlePageChange(page);
      trackPaginationChange("rankings", page);
    },
    [handlePageChange, trackPaginationChange]
  );

  const handleSortByChangeWithTracking = useCallback(
    (newSortBy: typeof sortBy) => {
      handleSortByChange(newSortBy);
      trackSortChange("rankings", newSortBy, order);
    },
    [handleSortByChange, trackSortChange, order]
  );

  const handleOrderChangeWithTracking = useCallback(
    (newOrder: typeof order) => {
      handleOrderChange(newOrder);
      trackSortChange("rankings", sortBy, newOrder);
    },
    [handleOrderChange, trackSortChange, sortBy]
  );

  const rankingCards = useMemo(
    () =>
      rankings.map((ranking, index) => (
        <RankingCard
          key={ranking._id}
          id={ranking._id}
          title={ranking.title}
          topPokemonImage={normalizePokemonImageSrc(ranking.image)}
          pokemonCount={ranking.pokemonCount}
          userTotalRankedPokemon={ranking.user?.rankedPokemonCount ?? 0}
          createdAt={ranking.createdAt}
          updatedAt={ranking.updatedAt}
          theme={ranking.theme}
          likesCount={ranking.likesCount}
          username={ranking.user?.username}
          onClick={() => handleRankingClick(ranking._id)}
        />
      )),
    [rankings, handleRankingClick]
  );

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-8xl">
        <ErrorMessage
          title={t("rankingsList.errorTitle")}
          description={t("rankingsList.errorDescription")}
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-8xl">
      <OfflineBanner />
      <Onboarding />
      <section className="pt-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("rankingsList.title")}</h1>
          <p className="text-muted-foreground">
            {t("rankingsList.description")}
          </p>
        </div>



        <RankingsListFilters
          searchValue={search}
          sortBy={sortBy}
          order={order}
          onSearchChange={handleSearchChange}
          onSortByChange={handleSortByChangeWithTracking}
          onOrderChange={handleOrderChangeWithTracking}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <RankingCardSkeleton key={index} />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <p className="text-muted-foreground">
              {t("rankingsList.noRankings")}
            </p>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="scroll-mt-4">
              <AnimatedList
                key={currentPage}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {rankingCards}
              </AnimatedList>
            </div>

            <SimplePagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChangeWithTracking}
            />
          </>
        )}
      </section>
    </main>
  );
}
