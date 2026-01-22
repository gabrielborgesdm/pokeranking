import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useRankingsControllerFindByUsername } from "@pokeranking/api-client";
import { useDeleteRanking } from "./use-delete-ranking";
import { useIsCurrentUser } from "@/features/users";
import { routes } from "@/lib/routes";

export function useUserRankings(username: string) {
  const router = useRouter();
  const isOwner = useIsCurrentUser(username);

  const { data, isLoading, error, refetch } =
    useRankingsControllerFindByUsername(username);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rankingToDelete, setRankingToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const rankings = useMemo(() => data?.data ?? [], [data]);

  const { deleteRanking, isDeleting } = useDeleteRanking({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setRankingToDelete(null);
      refetch();
    },
  });

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(routes.rankingEdit(id));
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

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(routes.ranking(id));
    },
    [router]
  );

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setRankingToDelete(null);
  }, []);

  return {
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
    handleCloseDeleteDialog,
    setDeleteDialogOpen,
  };
}
