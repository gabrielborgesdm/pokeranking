"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuthControllerResetPassword, isApiError } from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";

type TFunction = (key: string, options?: any) => string;

function createResetPasswordSchema(t: TFunction) {
  return z
    .object({
      password: z.string().min(6, t("validation.minLength", { min: 6 })),
      confirmPassword: z.string().min(6, t("validation.minLength", { min: 6 })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}

export type ResetPasswordFormData = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

export function useResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { trackResetPasswordSubmit } = useAnalytics();

  const resetPasswordMutation = useAuthControllerResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(createResetPasswordSchema(t)),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setError(null);

    resetPasswordMutation.mutate(
      { data: { token, password: data.password } },
      {
        onSuccess: () => {
          trackResetPasswordSubmit();
          setSuccess(true);
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        },
        onError: (err) => {
          if (isApiError(err)) {
            if (err.status === 404 || err.status === 400) {
              setError(t("auth.invalidResetToken"));
            } else {
              setError(err.message);
            }
          } else {
            setError(t("auth.resetPasswordFailed"));
          }
        },
      }
    );
  }

  return {
    form,
    token,
    error,
    success,
    isLoading: resetPasswordMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
