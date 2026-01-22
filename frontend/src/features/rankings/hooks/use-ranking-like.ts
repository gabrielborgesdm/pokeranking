import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  useRankingsControllerToggleLike,
  getAuthControllerGetProfileQueryKey,
  getRankingsControllerFindOneQueryKey,
} from "@pokeranking/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalytics } from "@/hooks/use-analytics";

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
  const { trackRankingLike, trackRankingUnlike } = useAnalytics();

  // Sync state when initial values change (e.g., when ranking data loads)
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

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
        // Track like/unlike based on final server state
        if (response.data.isLiked) {
          trackRankingLike(rankingId);
        } else {
          trackRankingUnlike(rankingId);
        }
      }
      // Invalidate rankings list, specific ranking, and profile caches
      void queryClient.invalidateQueries({ queryKey: ["/rankings"] });
      void queryClient.invalidateQueries({
        queryKey: getRankingsControllerFindOneQueryKey(rankingId),
      });
      void queryClient.invalidateQueries({
        queryKey: getAuthControllerGetProfileQueryKey(),
      });
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
    trackRankingLike,
    trackRankingUnlike,
  ]);

  return {
    likeCount,
    isLiked,
    isLoading,
    toggleLike,
  };
}
