"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUsersControllerUpdate,
  useAuthControllerGetProfile,
  getAuthControllerGetProfileQueryKey,
  isApiError,
} from "@pokeranking/api-client";
import { translateApiError } from "@/lib/translate-api-error";
import { routes } from "@/lib/routes";

type TFunction = (key: string, options?: Record<string, unknown>) => string;

function createAccountSchema(t: TFunction) {
  return z
    .object({
      username: z
        .string()
        .min(3, t("validation.minLength", { min: 3 }))
        .max(30, t("validation.maxLength", { max: 30 })),
      profilePic: z.string().min(1, t("validation.profilePicRequired")),
      newPassword: z
        .string()
        .min(6, t("validation.minLength", { min: 6 }))
        .optional()
        .or(z.literal("")),
      confirmPassword: z.string().optional().or(z.literal("")),
    })
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.newPassword === data.confirmPassword;
        }
        return true;
      },
      {
        message: t("auth.passwordsDontMatch"),
        path: ["confirmPassword"],
      }
    );
}

export type AccountFormData = z.infer<ReturnType<typeof createAccountSchema>>;

export function useAccountForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userId = session?.user?.id;

  const { data: profileData, isLoading: isLoadingUser } =
    useAuthControllerGetProfile({
      query: {
        enabled: !!userId,
      },
    });

  const updateMutation = useUsersControllerUpdate();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(createAccountSchema(t)),
    defaultValues: {
      username: "",
      profilePic: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Populate form with user data when loaded
  useEffect(() => {
    if (profileData?.status === 200 && profileData.data) {
      form.reset({
        username: profileData.data.username ?? "",
        profilePic: profileData.data.profilePic ?? "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profileData, form]);

  async function onSubmit(data: AccountFormData) {
    if (!userId) return;

    setError(null);
    setSuccess(false);

    const updateData: {
      username?: string;
      profilePic?: string;
      password?: string;
    } = {
      username: data.username,
      profilePic: data.profilePic,
    };

    // Only include password if user wants to change it
    if (data.newPassword && data.newPassword.length > 0) {
      updateData.password = data.newPassword;
    }

    updateMutation.mutate(
      { id: userId, data: updateData },
      {
        onSuccess: async (response) => {
          if (response.status === 200) {
            setSuccess(true);
            // Invalidate auth profile query cache
            await queryClient.invalidateQueries({
              queryKey: getAuthControllerGetProfileQueryKey(),
            });
            // Update the session with new user data
            await updateSession({
              ...session,
              user: {
                ...session?.user,
                username: data.username,
                profilePic: data.profilePic,
              },
            });
            // Clear password fields
            form.setValue("newPassword", "");
            form.setValue("confirmPassword", "");
          }
        },
        onError: (err) => {
          if (isApiError(err)) {
            setError(translateApiError(err, t));
          } else {
            setError(t("account.updateFailed"));
          }
        },
      }
    );
  }

  return {
    form,
    error,
    success,
    isLoading: updateMutation.isPending,
    isLoadingUser,
    userData: profileData?.status === 200 ? profileData.data : null,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
