"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuthControllerForgotPassword, isApiError } from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";
import { translateApiError } from "@/lib/translate-api-error";

type TFunction = (key: string, options?: any) => string;

function createForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });
}

export type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export function useForgotPassword() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { trackForgotPasswordSubmit } = useAnalytics();

  const forgotPasswordMutation = useAuthControllerForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setError(null);
    setSuccess(false);

    forgotPasswordMutation.mutate(
      { data },
      {
        onSuccess: () => {
          trackForgotPasswordSubmit();
          setSuccess(true);
        },
        onError: (err) => {
          if (isApiError(err)) {
            setError(translateApiError(err, t));
          } else {
            setError(t("auth.forgotPasswordFailed"));
          }
        },
      }
    );
  }

  return {
    form,
    error,
    success,
    isLoading: forgotPasswordMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
