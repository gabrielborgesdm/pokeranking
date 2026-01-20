"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import {
  RankingCard,
  RankingCardsSkeleton,
  RankingsError,
  useUserRankings,
} from "@/features/rankings";
import { AnimatedList } from "@/components/animated-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { normalizePokemonImageSrc } from "@/lib/image-utils";

interface UserRankingsPageProps {
  params: Promise<{ username: string }>;
}

export default function UserRankingsPage({ params }: UserRankingsPageProps) {
  const { username } = use(params);
  const { t } = useTranslation();

  const {
    rankings,
    isLoading,
    error,
    isOwner,
    deleteDialogOpen,
    rankingToDelete,
    isDeleting,
    handleRetry,
    handleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    handleCardClick,
    setDeleteDialogOpen,
  } = useUserRankings(username);

  const rankingCards = useMemo(
    () =>
      rankings.map((ranking) => (
        <RankingCard
          key={ranking._id}
          id={ranking._id}
          title={ranking.title}
          topPokemonImage={normalizePokemonImageSrc(ranking?.image)}
          pokemonCount={ranking.pokemonCount}
          createdAt={ranking.createdAt}
          updatedAt={ranking.updatedAt}
          theme={ranking.theme}
          onClick={() => handleCardClick(ranking._id)}
          onEdit={isOwner ? handleEdit : undefined}
          onDelete={isOwner ? handleDeleteClick : undefined}
        />
      )),
    [rankings, handleCardClick, handleEdit, handleDeleteClick, isOwner]
  );

  if (error) {
    return <RankingsError onRetry={handleRetry} />;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-8xl">
      <section className="space-y-8">
        <PageHeader
          title={t("userRankings.title", { username })}
          description={
            isOwner
              ? t("userRankings.descriptionOwner")
              : t("userRankings.description", { username })
          }
          action={
            !!isOwner && (
              <Button asChild>
                <Link href={routes.rankingNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("userRankings.createNew")}
                </Link>
              </Button>
            )
          }
        />

        {isLoading ? (
          <RankingCardsSkeleton />
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <p className="text-muted-foreground">
              {isOwner
                ? t("userRankings.noRankingsOwner")
                : t("userRankings.noRankings", { username })}
            </p>
            {isOwner && (
              <Button asChild size='lg' variant={'outline'} className="mt-4" >
                <Link href={routes.rankingNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("userRankings.createFirst")}
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <AnimatedList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {rankingCards}
          </AnimatedList>
        )}
      </section>

      {!!isOwner && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("userRankings.deleteConfirmTitle")}
          description={t("userRankings.deleteConfirmDescription", {
            title: rankingToDelete?.title,
          })}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          variant="destructive"
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      )}
    </main>
  );
}