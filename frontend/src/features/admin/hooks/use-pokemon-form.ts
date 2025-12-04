"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PokemonType } from "@pokeranking/shared";
import {
  usePokemonControllerCreate,
  usePokemonControllerUpdate,
  getPokemonControllerSearchQueryKey,
  isApiError,
} from "@pokeranking/api-client";
import { routes } from "@/lib/routes";

const pokemonFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: z.string().url("Valid image URL required"),
  types: z.array(z.string()).default([]),
  pokedexNumber: z.number().min(1).optional().nullable(),
  species: z.string().max(100).optional().nullable(),
  height: z.number().min(0).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  abilities: z.array(z.string()).default([]),
  hp: z.number().min(1).max(255).optional().nullable(),
  attack: z.number().min(1).max(255).optional().nullable(),
  defense: z.number().min(1).max(255).optional().nullable(),
  specialAttack: z.number().min(1).max(255).optional().nullable(),
  specialDefense: z.number().min(1).max(255).optional().nullable(),
  speed: z.number().min(1).max(255).optional().nullable(),
  generation: z.number().min(1).max(9).optional().nullable(),
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
      types: initialData?.types ?? [],
      pokedexNumber: initialData?.pokedexNumber ?? null,
      species: initialData?.species ?? null,
      height: initialData?.height ?? null,
      weight: initialData?.weight ?? null,
      abilities: initialData?.abilities ?? [],
      hp: initialData?.hp ?? null,
      attack: initialData?.attack ?? null,
      defense: initialData?.defense ?? null,
      specialAttack: initialData?.specialAttack ?? null,
      specialDefense: initialData?.specialDefense ?? null,
      speed: initialData?.speed ?? null,
      generation: initialData?.generation ?? null,
    },
  });

  async function onSubmit(data: PokemonFormData) {
    setError(null);

    // Clean up null values for the API
    const cleanData = {
      name: data.name,
      image: data.image,
      types: data.types as PokemonType[],
      ...(data.pokedexNumber != null && { pokedexNumber: data.pokedexNumber }),
      ...(data.species && { species: data.species }),
      ...(data.height != null && { height: data.height }),
      ...(data.weight != null && { weight: data.weight }),
      ...(data.abilities.length > 0 && { abilities: data.abilities }),
      ...(data.hp != null && { hp: data.hp }),
      ...(data.attack != null && { attack: data.attack }),
      ...(data.defense != null && { defense: data.defense }),
      ...(data.specialAttack != null && { specialAttack: data.specialAttack }),
      ...(data.specialDefense != null && { specialDefense: data.specialDefense }),
      ...(data.speed != null && { speed: data.speed }),
      ...(data.generation != null && { generation: data.generation }),
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({
        queryKey: getPokemonControllerSearchQueryKey(),
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
      createMutation.mutate({ data: cleanData }, { onSuccess, onError });
    } else {
      if (!pokemonId) {
        setError("Pokemon ID is required for edit mode");
        return;
      }
      updateMutation.mutate({ id: pokemonId, data: cleanData }, { onSuccess, onError });
    }
  }

  return {
    form,
    error,
    isLoading: createMutation.isPending || updateMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
