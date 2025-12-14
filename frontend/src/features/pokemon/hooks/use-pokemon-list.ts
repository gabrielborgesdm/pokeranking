"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  usePokemonControllerSearch,
  usePokemonControllerRemove,
  getPokemonControllerSearchQueryKey,
  type PokemonControllerSearchParams,
} from "@pokeranking/api-client";
import type { PokemonType } from "@pokeranking/shared";

export type SortByOption = "name" | "createdAt";
export type OrderOption = "asc" | "desc";

interface UsePokemonListOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePokemonList(options: UsePokemonListOptions = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { initialPage = 1, initialLimit = 20 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("createdAt");
  const [order, setOrder] = useState<OrderOption>("desc");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [generation, setGeneration] = useState<number | null>(null);

  const params: PokemonControllerSearchParams = {
    page,
    limit,
    sortBy,
    order,
    ...(search && { name: search }),
    ...(selectedTypes.length > 0 && { types: selectedTypes }),
  };

  const { data, isLoading, error, refetch } =
    usePokemonControllerSearch(params);

  const deleteMutation = usePokemonControllerRemove();

  const handleDelete = useCallback(
    async (id: string) => {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: getPokemonControllerSearchQueryKey(),
            });
            toast.success(t("admin.pokemon.deleteSuccess"));
          },
          onError: () => {
            toast.error(t("admin.pokemon.deleteError"));
          },
        }
      );
    },
    [deleteMutation, queryClient, t]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((value: SortByOption) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const handleOrderChange = useCallback((value: OrderOption) => {
    setOrder(value);
    setPage(1);
  }, []);

  const handleTypesChange = useCallback((types: PokemonType[]) => {
    setSelectedTypes(types);
    setPage(1);
  }, []);

  const handleGenerationChange = useCallback((gen: number | null) => {
    setGeneration(gen);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const pokemon = data?.status === 200 ? data.data.data : [];
  const total = data?.status === 200 ? data.data.total : 0;
  const totalPages = Math.ceil(total / limit);

  return {
    pokemon,
    total,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    order,
    selectedTypes,
    generation,
    isLoading,
    isDeleting: deleteMutation.isPending,
    error,
    handleSearchChange,
    handleSortByChange,
    handleOrderChange,
    handleTypesChange,
    handleGenerationChange,
    handlePageChange,
    handleLimitChange,
    handleDelete,
    refetch,
  };
}
