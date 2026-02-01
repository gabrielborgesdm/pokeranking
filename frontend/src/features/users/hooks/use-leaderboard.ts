"use client";

import { useState, useMemo, useCallback } from "react";
import { useUsersControllerFindAll } from "@pokeranking/api-client";
import { useThrottle } from "@/hooks/use-throttle";
import type { SortByOption, OrderOption } from "../components/leaderboard-filters";

const ITEMS_PER_PAGE = 12;

interface UseLeaderboardOptions {
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { scrollTargetRef } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUsername, setSearchUsername] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("rankedPokemonCount");
  const [order, setOrder] = useState<OrderOption>("desc");

  const { data, isLoading: isLoadingOG, error, refetch } = useUsersControllerFindAll({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy,
    order,
    username: searchUsername || undefined,
  });
  const isLoading = useThrottle(isLoadingOG, 500);

  const users = useMemo(() => data?.data?.data ?? [], [data]);
  const total = useMemo(() => data?.data?.total ?? 0, [data]);
  const totalPages = useMemo(() => Math.ceil(total / ITEMS_PER_PAGE), [total]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    scrollTargetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTargetRef]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchUsername(value);
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
    searchUsername,
    sortBy,
    order,

    // Data
    users,
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
