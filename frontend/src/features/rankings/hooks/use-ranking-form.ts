"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import {
  useRankingsControllerCreate,
  useRankingsControllerUpdate,
  getAuthControllerGetProfileQueryKey,
  isApiError,
  type CreateRankingDto,
  type UpdateRankingDto,
} from "@pokeranking/api-client";
import { THEME_IDS, DEFAULT_THEME_ID } from "@pokeranking/shared";
import { useAnalytics } from "@/hooks/use-analytics";
import { routes } from "@/lib/routes";

function createRankingFormSchema() {
  return z.object({
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
}

export type RankingFormData = z.infer<
  ReturnType<typeof createRankingFormSchema>
>;

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
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const { trackRankingCreate } = useAnalytics();
  const username = session?.user?.username ?? "";

  const createMutation = useRankingsControllerCreate();
  const updateMutation = useRankingsControllerUpdate();

  const form = useForm<RankingFormData>({
    resolver: zodResolver(createRankingFormSchema(t)),
    defaultValues: {
      title: initialData?.title ?? "",
      theme: initialData?.theme ?? DEFAULT_THEME_ID,
      background: initialData?.background ?? undefined,
      zones: initialData?.zones ?? [],
    },
  });

  async function onSubmit(data: RankingFormData) {
    setError(null);

    // Transform zones to match API type (interval as number[] which can contain null)
    const apiData = {
      ...data,
      zones: data.zones?.map((zone) => ({
        ...zone,
        interval: zone.interval as unknown as number[],
      })),
    } as CreateRankingDto | UpdateRankingDto;

    if (mode === "create") {
      createMutation.mutate(
        { data: apiData as CreateRankingDto },
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
              router.push(routes.userRankings(username));
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
        { id: rankingId, data: apiData as UpdateRankingDto },
        {
          onSuccess: (response) => {
            if (response.status === 200) {
              // Invalidate profile query to refresh rankings list
              queryClient.invalidateQueries({
                queryKey: getAuthControllerGetProfileQueryKey(),
              });
              onSuccess?.();
              router.push(routes.userRankings(username));
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
