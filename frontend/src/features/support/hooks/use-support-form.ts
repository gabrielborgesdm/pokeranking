"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";
import {
  useSupportControllerCreate,
  isApiError,
} from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";
import { translateApiError } from "@/lib/translate-api-error";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";

type TFunction = (key: string, options?: any) => string;

function createSupportFormSchema(t: TFunction) {
  return z.object({
    message: z
      .string()
      .min(10, t("validation.minLength", { min: 10 }))
      .max(2000, t("validation.maxLength", { max: 2000 })),
  });
}

export type SupportFormData = z.infer<ReturnType<typeof createSupportFormSchema>>;

export function useSupportForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const { trackSupportSubmitSuccess, trackSupportSubmitError } = useAnalytics();
  const { user } = useCurrentUser();

  const mutation = useSupportControllerCreate();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(createSupportFormSchema(t)),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(data: SupportFormData) {
    setError(null);

    mutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          if (response.status === 201) {
            Sentry.captureException(
              new Error(`Support ticket created: ${user?.username || '<unknown user>'} ${data.message}`),
            );
            trackSupportSubmitSuccess();
            toast.success(t("support.successTitle"), {
              description: t("support.successMessage"),
            });
            form.reset();
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            trackSupportSubmitError(err.message);
            setError(translateApiError(err, t));
          } else {
            trackSupportSubmitError("unknown_error");
            setError(t("support.errorMessage"));
          }
        },
      }
    );
  }

  return {
    form,
    error,
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
