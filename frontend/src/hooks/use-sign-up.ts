"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuthControllerRegister, isApiError } from "@pokeranking/api-client";

const signUpSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export function useSignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useAuthControllerRegister();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    setError(null);

    registerMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          if (response.status === 201) {
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            if (err.status === 409) {
              setError(t("auth.userExists"));
            } else {
              setError(err.message);
            }
          } else {
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
