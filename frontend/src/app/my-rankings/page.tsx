"use client";

import { useMemo, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useAuthControllerGetProfile } from "@pokeranking/api-client";
import { RankingCard, RankingCardSkeleton } from "@/features/rankings";
import { AnimatedList } from "@/components/animated-list";
import { ErrorMessage } from "@/components/error-message";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteRanking } from "@/hooks/use-delete-ranking";

const SKELETON_COUNT = 6;

export default function MyRankingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAuthControllerGetProfile();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rankingToDelete, setRankingToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const rankings = useMemo(() => data?.data?.rankings ?? [], [data]);

  const { deleteRanking, isDeleting } = useDeleteRanking({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setRankingToDelete(null);
    },
  });

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/my-rankings/${id}/edit`);
    },
    [router]
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      const ranking = rankings.find((r) => r._id === id);
      if (ranking) {
        setRankingToDelete({ id: ranking._id, title: ranking.title });
        setDeleteDialogOpen(true);
      }
    },
    [rankings]
  );

  const handleConfirmDelete = useCallback(() => {
    if (rankingToDelete) {
      deleteRanking(rankingToDelete.id);
    }
  }, [rankingToDelete, deleteRanking]);

  const rankingCards = useMemo(
    () =>
      rankings.map((ranking) => (
        <RankingCard
          key={ranking._id}
          id={ranking._id}
          title={ranking.title}
          topPokemonImage={ranking.pokemon[0]?.image}
          pokemonCount={ranking.pokemon.length}
          createdAt={ranking.createdAt}
          updatedAt={ranking.updatedAt}
          theme={ranking.theme}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )),
    [rankings, handleEdit, handleDeleteClick]
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("myRankings.deleteConfirmTitle")}
        description={t("myRankings.deleteConfirmDescription", {
          title: rankingToDelete?.title,
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </main>
  );
}
