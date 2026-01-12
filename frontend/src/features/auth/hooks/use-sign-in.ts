"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "@/hooks/use-analytics";

type TFunction = (key: string, options?: any) => string;

function createSignInSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.minLength", { min: 6 })),
  });
}

export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;

export function useSignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSignInSuccess, trackSignInError } = useAnalytics();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(createSignInSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      trackSignInError(result.error);
      setError(t("auth.invalidCredentials"));
      return;
    }

    trackSignInSuccess("credentials");
    router.push("/");
    router.refresh();
  }

  return {
    form,
    error,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
