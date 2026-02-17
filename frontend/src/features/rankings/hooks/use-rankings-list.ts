"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useRankingsControllerFindAll,
  RankingsControllerFindAllSortBy,
  RankingsControllerFindAllOrder,
} from "@pokeranking/api-client";
import { useThrottle } from "@/hooks/use-throttle";

export type SortByOption = RankingsControllerFindAllSortBy;
export type OrderOption = RankingsControllerFindAllOrder;

const ITEMS_PER_PAGE = 12;
const DEFAULT_SORT_BY: SortByOption = "pokemonCount";
const DEFAULT_ORDER: OrderOption = "desc";

const VALID_SORT_BY_VALUES: SortByOption[] = ["likesCount", "createdAt", "pokemonCount"];
const VALID_ORDER_VALUES: OrderOption[] = ["asc", "desc"];

function isValidSortBy(value: string | null): value is SortByOption {
  return value !== null && VALID_SORT_BY_VALUES.includes(value as SortByOption);
}

function isValidOrder(value: string | null): value is OrderOption {
  return value !== null && VALID_ORDER_VALUES.includes(value as OrderOption);
}

interface UseRankingsListOptions {
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
}

export function useRankingsList(options: UseRankingsListOptions = {}) {
  const { scrollTargetRef } = options;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read state from URL params
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const search = searchParams.get("search") || "";
  const sortByParam = searchParams.get("sortBy");
  const orderParam = searchParams.get("order");
  const sortBy: SortByOption = isValidSortBy(sortByParam) ? sortByParam : DEFAULT_SORT_BY;
  const order: OrderOption = isValidOrder(orderParam) ? orderParam : DEFAULT_ORDER;

  // Helper to update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" ||
            (key === "page" && value === 1) ||
            (key === "sortBy" && value === DEFAULT_SORT_BY) ||
            (key === "order" && value === DEFAULT_ORDER)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
    },
    [searchParams, router]
  );

  const {
    data,
    isLoading: isLoadingOG,
    error,
    refetch,
  } = useRankingsControllerFindAll({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy,
    order,
    search: search || undefined,
  });
  const isLoading = useThrottle(isLoadingOG, 500);

  const rankings = useMemo(() => data?.data?.data ?? [], [data]);
  const total = useMemo(() => data?.data?.total ?? 0, [data]);
  const totalPages = useMemo(() => Math.ceil(total / ITEMS_PER_PAGE), [total]);

  const handlePageChange = useCallback((page: number) => {
    updateParams({ page });
    scrollTargetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [updateParams, scrollTargetRef]);

  const handleSearchChange = useCallback((value: string) => {
    updateParams({ search: value, page: 1 });
  }, [updateParams]);

  const handleSortByChange = useCallback((value: SortByOption) => {
    updateParams({ sortBy: value, page: 1 });
  }, [updateParams]);

  const handleOrderChange = useCallback((value: OrderOption) => {
    updateParams({ order: value, page: 1 });
  }, [updateParams]);

  return {
    // State
    currentPage,
    search,
    sortBy,
    order,

    // Data
    rankings,
    total,
    totalPages,
    isLoading,
    error,
    refetch,

    // Handlers
    handlePageChange,
    handleSearchChange,
    handleSortByChange,
    handleOrderChange,

    // Constants
    ITEMS_PER_PAGE,
  };
}
