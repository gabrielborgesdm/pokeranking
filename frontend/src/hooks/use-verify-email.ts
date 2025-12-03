"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  useAuthControllerVerifyEmail,
  useAuthControllerResendVerification,
  isApiError,
} from "@pokeranking/api-client";

const verifyEmailSchema = z.object({
  code: z.string().length(6),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export function useVerifyEmail() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyMutation = useAuthControllerVerifyEmail();
  const resendMutation = useAuthControllerResendVerification();

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: VerifyEmailFormData) {
    setError(null);

    verifyMutation.mutate(
      { data: { email, code: data.code } },
      {
        onSuccess: async (response) => {
          if (response.status === 200 && response.data.access_token) {
            await signIn("credentials", {
              redirect: false,
            });
            router.push("/");
            router.refresh();
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            if (err.status === 404) {
              setError(t("auth.invalidCode"));
            } else if (err.status === 429) {
              setError(t("auth.tooManyAttempts"));
            } else {
              setError(err.message);
            }
          } else {
            setError(t("auth.verificationFailed"));
          }
        },
      }
    );
  }

  function onResend() {
    setError(null);
    setResendSuccess(false);

    resendMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          setResendSuccess(true);
        },
        onError: (err) => {
          if (isApiError(err)) {
            if (err.status === 429) {
              setError(t("auth.tooManyAttempts"));
            } else {
              setError(err.message);
            }
          } else {
            setError(t("auth.resendFailed"));
          }
        },
      }
    );
  }

  return {
    form,
    email,
    error,
    resendSuccess,
    isLoading: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    onResend,
  };
}
