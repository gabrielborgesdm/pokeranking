import { useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRankingsControllerRemove, getAuthControllerGetProfileQueryKey } from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";

interface UseDeleteRankingOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteRanking(options?: UseDeleteRankingOptions) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { trackRankingDelete } = useAnalytics();
  const deletingIdRef = useRef<string | null>(null);

  const { mutate, isPending } = useRankingsControllerRemove({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 204) {
          if (deletingIdRef.current) {
            trackRankingDelete(deletingIdRef.current);
          }
          // Invalidate profile query to refresh rankings list
          queryClient.invalidateQueries({
            queryKey: getAuthControllerGetProfileQueryKey(),
          });
          options?.onSuccess?.();
        } else {
          setError("Failed to delete ranking");
          options?.onError?.(new Error("Failed to delete ranking"));
        }
      },
      onError: (err) => {
        setError("Failed to delete ranking");
        options?.onError?.(err);
      },
    },
  });

  const deleteRanking = useCallback(
    (id: string) => {
      setError(null);
      deletingIdRef.current = id;
      mutate({ id });
    },
    [mutate]
  );

  return {
    deleteRanking,
    isDeleting: isPending,
    error,
  };
}
