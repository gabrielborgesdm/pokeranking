"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  useRankingsControllerCreate,
  useRankingsControllerUpdate,
  getAuthControllerGetProfileQueryKey,
  isApiError,
} from "@pokeranking/api-client";
import { THEME_IDS, DEFAULT_THEME_ID } from "@pokeranking/shared";
import { useAnalytics } from "@/hooks/use-analytics";

const rankingFormSchema = z.object({
  title: z.string().min(1).max(100),
  theme: z.string().refine((val) => THEME_IDS.includes(val), {
    message: "Invalid theme",
  }),
  background: z
    .string()
    .refine((val) => !val || THEME_IDS.includes(val), {
      message: "Invalid background",
    })
    .optional(),
});

export type RankingFormData = z.infer<typeof rankingFormSchema>;

interface UseRankingFormOptions {
  mode: "create" | "edit";
  rankingId?: string;
  initialData?: Partial<RankingFormData>;
  onSuccess?: () => void;
}

export function useRankingForm({
  mode,
  rankingId,
  initialData,
  onSuccess,
}: UseRankingFormOptions) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { trackRankingCreate } = useAnalytics();

  const createMutation = useRankingsControllerCreate();
  const updateMutation = useRankingsControllerUpdate();

  const form = useForm<RankingFormData>({
    resolver: zodResolver(rankingFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      theme: initialData?.theme ?? DEFAULT_THEME_ID,
      background: initialData?.background ?? undefined,
    },
  });

  async function onSubmit(data: RankingFormData) {
    setError(null);

    if (mode === "create") {
      createMutation.mutate(
        { data },
        {
          onSuccess: (response) => {
            if (response.status === 201) {
              const createdRanking = response.data;
              trackRankingCreate(createdRanking._id, createdRanking.title);
              // Invalidate profile query to refresh rankings list
              queryClient.invalidateQueries({
                queryKey: getAuthControllerGetProfileQueryKey(),
              });
              onSuccess?.();
              router.push("/my-rankings");
            }
          },
          onError: (err) => {
            if (isApiError(err)) {
              setError(err.message);
            } else {
              setError(t("rankingForm.saveFailed"));
            }
          },
        }
      );
    } else {
      if (!rankingId) {
        setError("Ranking ID is required for edit mode");
        return;
      }

      updateMutation.mutate(
        { id: rankingId, data },
        {
          onSuccess: (response) => {
            if (response.status === 200) {
              // Invalidate profile query to refresh rankings list
              queryClient.invalidateQueries({
                queryKey: getAuthControllerGetProfileQueryKey(),
              });
              onSuccess?.();
              router.push("/my-rankings");
            }
          },
          onError: (err) => {
            if (isApiError(err)) {
              setError(err.message);
            } else {
              setError(t("rankingForm.saveFailed"));
            }
          },
        }
      );
    }
  }

  return {
    form,
    error,
    isLoading: createMutation.isPending || updateMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
