"use client";

import { use } from "react";
import { useTranslation } from "react-i18next";
import { notFound } from "next/navigation";
import { RankingForm, useRankingEditData } from "@/features/rankings";
import { PageHeader, PageHeaderSkeleton } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizePokemonImageSrc } from "@/lib/image-utils";
import { routes } from "@/lib/routes";

interface EditRankingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditRankingPage({ params }: EditRankingPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();

  const { ranking, isLoading, notFound: rankingNotFound } = useRankingEditData({
    rankingId: id,
  });

  if (rankingNotFound) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        {isLoading || !ranking ? (
          <>
            <PageHeaderSkeleton hasBack />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </>
        ) : (
          <>
            <PageHeader
              title={t("rankingForm.editTitle")}
              description={t("rankingForm.editDescription")}
              backHref={routes.ranking(id)}
              backLabel={t("common.back")}
            />
            <RankingForm
              mode="edit"
              rankingId={id}
              initialData={{
                title: ranking.title,
                theme: ranking.theme,
                background: ranking.background ?? undefined,
              }}
              pokemonCount={ranking.pokemonCount}
              topPokemonImage={normalizePokemonImageSrc(ranking.image)}
            />
          </>
        )}
      </div>
    </main>
  );
}
