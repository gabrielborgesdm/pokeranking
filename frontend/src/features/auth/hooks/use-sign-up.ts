"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuthControllerRegister, isApiError } from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";
import { translateApiError } from "@/lib/translate-api-error";

type TFunction = (key: string, options?: any) => string;

function createSignUpSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("validation.invalidEmail")),
    username: z
      .string()
      .min(3, t("validation.minLength", { min: 3 }))
      .max(30, t("validation.maxLength", { max: 30 })),
    password: z.string().min(6, t("validation.minLength", { min: 6 })),
    profilePic: z.string().min(1, t("validation.profilePicRequired")),
  });
}

export type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;

export function useSignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useAuthControllerRegister();
  const { trackSignUpSuccess, trackSignUpError } = useAnalytics();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(createSignUpSchema(t)),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      profilePic: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    setError(null);

    registerMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          if (response.status === 201) {
            trackSignUpSuccess();
            router.push(
              `/verify-email?email=${encodeURIComponent(data.email)}`
            );
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            trackSignUpError(err.message);
            setError(translateApiError(err, t));
          } else {
            trackSignUpError("unknown_error");
            setError(t("auth.registrationFailed"));
          }
        },
      }
    );
  }

  return {
    form,
    error,
    isLoading: registerMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
