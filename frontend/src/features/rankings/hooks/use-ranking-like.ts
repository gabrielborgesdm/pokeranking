import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRankingsControllerToggleLike } from "@pokeranking/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface UseRankingLikeOptions {
  /** Ranking ID */
  rankingId: string;
  /** Initial like count */
  initialLikeCount?: number;
  /** Whether initially liked by current user */
  initialIsLiked?: boolean;
}

interface UseRankingLikeResult {
  /** Current like count */
  likeCount: number;
  /** Whether current user has liked */
  isLiked: boolean;
  /** Whether a like operation is in progress */
  isLoading: boolean;
  /** Toggle like status */
  toggleLike: () => void;
}

/**
 * useRankingLike - Hook for managing ranking like state
 *
 * Uses optimistic updates for a responsive UI and syncs with the backend.
 */
export function useRankingLike({
  rankingId,
  initialLikeCount = 0,
  initialIsLiked = false,
}: UseRankingLikeOptions): UseRankingLikeResult {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: toggleLikeMutation } =
    useRankingsControllerToggleLike();

  const toggleLike = useCallback(async () => {
    if (!session?.accessToken || isLoading) return;

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    setIsLoading(true);

    try {
      const response = await toggleLikeMutation({ id: rankingId });
      // Sync with server response
      if (response.status === 200) {
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.likesCount);
      }
      // Invalidate rankings list cache
      void queryClient.invalidateQueries({ queryKey: ["/rankings"] });
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLiked,
    rankingId,
    session?.accessToken,
    isLoading,
    toggleLikeMutation,
    queryClient,
  ]);

  return {
    likeCount,
    isLiked,
    isLoading,
    toggleLike,
  };
}
