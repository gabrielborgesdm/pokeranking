"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  useSupportControllerCreate,
  isApiError,
} from "@pokeranking/api-client";

const supportFormSchema = z.object({
  message: z.string().min(10).max(2000),
});

export type SupportFormData = z.infer<typeof supportFormSchema>;

export function useSupportForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const mutation = useSupportControllerCreate();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
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
            toast.success(t("support.successTitle"), {
              description: t("support.successMessage"),
            });
            form.reset();
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            setError(err.message);
          } else {
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
