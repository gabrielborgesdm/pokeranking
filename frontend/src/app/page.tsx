"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  UserCard,
  UserCardSkeleton,
  LeaderboardFilters,
  useLeaderboard,
} from "@/features/users";
import { SimplePagination } from "@/components/pagination";
import { ErrorMessage } from "@/components/error-message";
import { getVariantByIndex } from "@/lib/utils";
import { AnimatedList } from "@/components/animated-list";
import { routes } from "@/lib/routes";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currentPage,
    searchUsername,
    sortBy,
    order,
    users,
    total,
    totalPages,
    isLoading,
    error,
    refetch,
    handlePageChange,
    handleSearchChange,
    handleSortByChange,
    handleOrderChange,
    ITEMS_PER_PAGE,
  } = useLeaderboard();

  const handleUserClick = useCallback(
    (username: string, rankings: { _id: string }[]) => {
      if (rankings.length === 1) {
        router.push(routes.ranking(rankings[0]._id));
      } else if (rankings.length > 1) {
        router.push(routes.userRankings(username));
      }
    },
    [router]
  );

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
            onClick={
              user.rankings.length > 0
                ? () => handleUserClick(user.username, user.rankings)
                : undefined
            }
          />
        );
      }),
    [users, currentPage, ITEMS_PER_PAGE, handleUserClick]
  );

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorMessage
          title={t("leaderboard.errorTitle")}
          description={t("leaderboard.errorDescription")}
          onRetry={() => refetch()}
        />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              {userCards}
            </AnimatedList>

            <SimplePagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  );
}
