"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useAuthControllerGetProfile } from "@pokeranking/api-client";
import { RankingCard, RankingCardSkeleton } from "@/features/rankings";
import { AnimatedList } from "@/components/animated-list";
import { ErrorMessage } from "@/components/error-message";
import { Button } from "@/components/ui/button";

const SKELETON_COUNT = 6;

export default function MyRankingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useAuthControllerGetProfile();

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const rankings = useMemo(() => data?.data?.rankings ?? [], [data]);

  const rankingCards = useMemo(
    () =>
      rankings.map((ranking) => (
        <RankingCard
          key={ranking._id}
          title={ranking.title}
          topPokemonImage={ranking.pokemon[0]?.image}
          pokemonCount={ranking.pokemon.length}
          createdAt={ranking.createdAt}
          updatedAt={ranking.updatedAt}
          theme={ranking.theme}
        />
      )),
    [rankings]
  );

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorMessage
          title={t("myRankings.errorTitle")}
          description={t("myRankings.errorDescription")}
          onRetry={handleRetry}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("myRankings.title")}</h1>
            <p className="text-muted-foreground">{t("myRankings.description")}</p>
          </div>
          <Button asChild>
            <Link href="/my-rankings/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("myRankings.createNew")}
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <RankingCardSkeleton key={index} />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <p className="text-muted-foreground">{t("myRankings.noRankings")}</p>
          </div>
        ) : (
          <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankingCards}
          </AnimatedList>
        )}
      </section>
    </main>
  );
}
