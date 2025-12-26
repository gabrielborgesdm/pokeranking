"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useRankingsControllerFindAll,
  RankingsControllerFindAllSortBy,
  RankingsControllerFindAllOrder,
} from "@pokeranking/api-client";
import { useThrottle } from "@/hooks/use-throttle";

export type SortByOption = RankingsControllerFindAllSortBy;
export type OrderOption = RankingsControllerFindAllOrder;

const ITEMS_PER_PAGE = 12;

export function useRankingsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("likesCount");
  const [order, setOrder] = useState<OrderOption>("desc");

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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleSortByChange = useCallback((value: SortByOption) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handleOrderChange = useCallback((value: OrderOption) => {
    setOrder(value);
    setCurrentPage(1);
  }, []);

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
