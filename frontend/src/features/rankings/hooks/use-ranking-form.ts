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
  getRankingsControllerFindByUsernameQueryKey,
  getRankingsControllerFindOneQueryKey,
  isApiError,
  type CreateRankingDto,
  type UpdateRankingDto,
} from "@pokeranking/api-client";
import { THEME_IDS, DEFAULT_THEME_ID } from "@pokeranking/shared";
import { useAnalytics } from "@/hooks/use-analytics";
import { routes } from "@/lib/routes";
import { translateApiError } from "@/lib/translate-api-error";

type TFunction = (key: string, options?: any) => string;

function createRankingFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .min(1, t("validation.required"))
      .max(100, t("validation.maxLength", { max: 100 })),
    theme: z.string().refine((val) => THEME_IDS.includes(val), {
      message: t("rankingForm.invalidTheme"),
    }),
    background: z
      .string()
      .refine((val) => !val || THEME_IDS.includes(val), {
        message: t("rankingForm.invalidBackground"),
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
  const { trackRankingCreate, trackRankingEdit } = useAnalytics();
  const username = session?.user?.username ?? "";

  const createMutation = useRankingsControllerCreate();
  const updateMutation = useRankingsControllerUpdate();

  const form = useForm<RankingFormData>({
    resolver: zodResolver(createRankingFormSchema(t)),
    defaultValues: {
      title: initialData?.title ?? "",
      theme: initialData?.theme ?? DEFAULT_THEME_ID,
      background: initialData?.background ?? undefined,
    },
  });

  async function onSubmit(data: RankingFormData) {
    setError(null);

    const apiData = data as CreateRankingDto | UpdateRankingDto;

    if (mode === "create") {
      createMutation.mutate(
        { data: apiData as CreateRankingDto },
        {
          onSuccess: (response) => {
            const createdRanking = response.data;
            if (response.status === 201 && createdRanking) {
              trackRankingCreate(createdRanking._id, createdRanking.title);
              // Invalidate queries to refresh rankings list
              queryClient.invalidateQueries({
                queryKey: getAuthControllerGetProfileQueryKey(),
              });
              queryClient.invalidateQueries({
                queryKey: getRankingsControllerFindByUsernameQueryKey(username),
              });
              onSuccess?.();
              router.push(routes.ranking(createdRanking._id));
            } else {
              setError(t("rankingForm.saveFailed"));
            }
          },
          onError: (err) => {
            if (isApiError(err)) {
              setError(translateApiError(err, t));
            } else {
              setError(t("rankingForm.saveFailed"));
            }
          },
        }
      );
    } else {
      if (!rankingId) {
        setError(t("rankingForm.rankingIdRequired"));
        return;
      }

      updateMutation.mutate(
        { id: rankingId, data: apiData as UpdateRankingDto },
        {
          onSuccess: (response) => {
            if (response.status === 200) {
              trackRankingEdit(rankingId, data.title);
              // Invalidate queries to refresh rankings list and ranking detail
              queryClient.invalidateQueries({
                queryKey: getAuthControllerGetProfileQueryKey(),
              });
              queryClient.invalidateQueries({
                queryKey: getRankingsControllerFindByUsernameQueryKey(username),
              });
              queryClient.invalidateQueries({
                queryKey: getRankingsControllerFindOneQueryKey(rankingId),
              });
              onSuccess?.();
              router.back();
            }
          },
          onError: (err) => {
            if (isApiError(err)) {
              setError(translateApiError(err, t));
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
