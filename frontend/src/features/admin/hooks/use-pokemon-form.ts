"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  usePokemonControllerCreate,
  usePokemonControllerUpdate,
  getPokemonControllerFindAllQueryKey,
  isApiError,
} from "@pokeranking/api-client";
import { routes } from "@/lib/routes";

const pokemonFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: z.string().url("Valid image URL required"),
});

export type PokemonFormData = z.infer<typeof pokemonFormSchema>;

interface UsePokemonFormOptions {
  mode: "create" | "edit";
  pokemonId?: string;
  initialData?: Partial<PokemonFormData>;
}

export function usePokemonForm({
  mode,
  pokemonId,
  initialData,
}: UsePokemonFormOptions) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createMutation = usePokemonControllerCreate();
  const updateMutation = usePokemonControllerUpdate();

  const form = useForm<PokemonFormData>({
    resolver: zodResolver(pokemonFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      image: initialData?.image ?? "",
    },
  });

  async function onSubmit(data: PokemonFormData) {
    setError(null);

    const onSuccess = () => {
      queryClient.invalidateQueries({
        queryKey: getPokemonControllerFindAllQueryKey(),
      });
      toast.success(t("admin.pokemon.saveSuccess"));
      router.push(routes.adminPokemon);
    };

    const onError = (err: unknown) => {
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError(t("admin.pokemon.saveError"));
      }
    };

    if (mode === "create") {
      createMutation.mutate({ data }, { onSuccess, onError });
    } else {
      if (!pokemonId) {
        setError("Pokemon ID is required for edit mode");
        return;
      }
      updateMutation.mutate({ id: pokemonId, data }, { onSuccess, onError });
    }
  }

  return {
    form,
    error,
    isLoading: createMutation.isPending || updateMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
