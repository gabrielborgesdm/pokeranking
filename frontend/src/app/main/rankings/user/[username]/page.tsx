"use client";

import { use, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Plus, Heart } from "lucide-react";
import { useAuthControllerGetProfile } from "@pokeranking/api-client";
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
import { BackButton } from "@/components/back-button";

interface UserRankingsPageProps {
  params: Promise<{ username: string }>;
}

export default function UserRankingsPage({ params }: UserRankingsPageProps) {
  const { username: encodedUsername } = use(params);
  const username = decodeURIComponent(encodedUsername);
  const { t } = useTranslation();
  const router = useRouter();

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

  const { data: profileData, isLoading: isProfileLoading } =
    useAuthControllerGetProfile({
      query: {
        enabled: isOwner,
      },
    });

  const likedRankings = useMemo(
    () => profileData?.data?.likedRankings ?? [],
    [profileData]
  );

  const handleLikedCardClick = useCallback(
    (id: string) => {
      router.push(routes.ranking(id));
    },
    [router]
  );

  const rankingCards = useMemo(
    () =>
      rankings.map((ranking) => (
        <RankingCard
          key={ranking._id}
          id={ranking._id}
          title={ranking.title}
          topPokemonImage={normalizePokemonImageSrc(ranking?.image)}
          pokemonCount={ranking.pokemonCount}
          userTotalRankedPokemon={ranking.user?.rankedPokemonCount ?? 0}
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
    <div className="container mx-auto px-4 mx-auto py-4">
      <main className="py-4 max-w-8xl">
        <section className="space-y-8">
          <BackButton />
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

        {isOwner && (
          <section className="space-y-8 mt-12">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 dark:fill-red-500" />
              <h2 className="text-2xl font-bold">
                {t("userRankings.likedRankingsTitle")}
              </h2>
            </div>

            {isProfileLoading ? (
              <RankingCardsSkeleton />
            ) : likedRankings.length === 0 ? (
              <p className="text-muted-foreground">
                {t("userRankings.noLikedRankings")}
              </p>
            ) : (
              <AnimatedList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {likedRankings.map((ranking) => (
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
                    onClick={() => handleLikedCardClick(ranking._id)}
                  />
                ))}
              </AnimatedList>
            )}
          </section>
        )}

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
    </div>
  );
}