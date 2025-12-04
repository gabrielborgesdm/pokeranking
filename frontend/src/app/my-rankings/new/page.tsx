"use client";

import { useTranslation } from "react-i18next";
import { usePokemonControllerGetCount } from "@pokeranking/api-client";
import { RankingForm } from "@/features/rankings";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRankingPage() {
  const { t } = useTranslation();
  const { data: countData, isLoading: isCountLoading } =
    usePokemonControllerGetCount();

  const totalPokemon = countData?.data?.totalPokemonCount ?? 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("rankingForm.createTitle")}</h1>
          <p className="text-muted-foreground">
            {t("rankingForm.createDescription")}
          </p>
        </div>

        {isCountLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RankingForm
            mode="create"
            pokemonCount={0}
            totalPokemonInSystem={totalPokemon}
          />
        )}
      </div>
    </main>
  );
}
