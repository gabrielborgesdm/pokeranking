"use client";

import { useState, useEffect, useRef } from "react";
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
import { translateApiError } from "@/lib/translate-api-error";
import { routes } from "@/lib/routes";

type TFunction = (key: string, options?: any) => string;

function createVerifyEmailSchema(t: TFunction) {
  return z.object({
    code: z.string().length(6, t("validation.exactLength", { length: 6 })),
  });
}

export type VerifyEmailFormData = z.infer<ReturnType<typeof createVerifyEmailSchema>>;

export function useVerifyEmail() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const codeFromUrl = searchParams.get("code") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const verifyMutation = useAuthControllerVerifyEmail();
  const resendMutation = useAuthControllerResendVerification();

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(createVerifyEmailSchema(t)),
    defaultValues: {
      code: codeFromUrl,
    },
  });

  // Auto-submit when a valid 6-digit code is present in the URL
  useEffect(() => {
    if (codeFromUrl.length === 6 && email && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      form.handleSubmit(onSubmit)();
    }
  }, [codeFromUrl, email]);

  async function onSubmit(data: VerifyEmailFormData) {
    setError(null);

    verifyMutation.mutate(
      { data: { email, code: data.code } },
      {
        onSuccess: async (response) => {
          if (response.status === 200 && response.data.access_token) {
            const result = await signIn("credentials", {
              token: response.data.access_token,
              redirect: false,
            });
            if (result?.ok) {
              router.push(routes.home);
              router.refresh();
            } else {
              setError(t("auth.verificationFailed"));
            }
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            setError(translateApiError(err, t));
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
            setError(translateApiError(err, t));
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
