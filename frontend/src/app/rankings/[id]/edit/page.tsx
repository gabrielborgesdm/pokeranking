"use client";

import { use } from "react";
import { useTranslation } from "react-i18next";
import { notFound } from "next/navigation";
import { RankingForm } from "@/features/rankings";
import { Skeleton } from "@/components/ui/skeleton";
import { useRankingEditData } from "@/hooks/use-ranking-edit-data";

interface EditRankingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditRankingPage({ params }: EditRankingPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();

  const {
    ranking,
    totalPokemon,
    isLoading,
    notFound: rankingNotFound,
  } = useRankingEditData({ rankingId: id });

  if (rankingNotFound) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("rankingForm.editTitle")}</h1>
          <p className="text-muted-foreground">
            {t("rankingForm.editDescription")}
          </p>
        </div>

        {isLoading || !ranking ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RankingForm
            mode="edit"
            rankingId={id}
            initialData={{
              title: ranking.title,
              theme: ranking.theme,
              background: ranking.background ?? undefined,
            }}
            pokemonCount={ranking.pokemon.length}
            totalPokemonInSystem={totalPokemon}
            topPokemonImage={ranking.pokemon[0]?.image}
          />
        )}
      </div>
    </main>
  );
}
