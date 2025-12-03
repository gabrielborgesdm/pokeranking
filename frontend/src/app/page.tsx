"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUsersControllerFindAll } from "@pokeranking/api-client";
import { UserCard } from "@/components/user-card";
import { UserCardSkeleton } from "@/components/user-card-skeleton";
import { Pagination } from "@/components/pagination";
import { getVariantByIndex } from "@/lib/utils";
import { useThrottle } from "@/hooks/use-throttle";
import { AnimatedList } from "@/components/animated-list";
import {
  LeaderboardFilters,
  SortByOption,
  OrderOption,
} from "@/components/leaderboard-filters";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUsername, setSearchUsername] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("rankedPokemonCount");
  const [order, setOrder] = useState<OrderOption>("desc");

  const { data, isLoading: isLoadingOG, error } = useUsersControllerFindAll({
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  const userCards = useMemo(
    () =>
      users.map((user, index) => {
        const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
        return (
          <UserCard
            key={user.username}
            rank={rank}
            username={user.username}
            avatarUrl={user.profilePic}
            totalScore={user.rankedPokemonCount}
            variant={getVariantByIndex(index)}
          />
        );
      }),
    [users, currentPage]
  );

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h1 className="text-2xl font-bold text-destructive">
            {t("leaderboard.errorTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("leaderboard.errorDescription")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("leaderboard.title")}</h1>
          <p className="text-muted-foreground">{t("leaderboard.description")}</p>
        </div>

        <LeaderboardFilters
          searchValue={searchUsername}
          sortBy={sortBy}
          order={order}
          onSearchChange={handleSearchChange}
          onSortByChange={handleSortByChange}
          onOrderChange={handleOrderChange}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <p className="text-muted-foreground">{t("leaderboard.noUsers")}</p>
          </div>
        ) : (
          <>
            <AnimatedList
              key={currentPage}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userCards}
            </AnimatedList>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  );
}
