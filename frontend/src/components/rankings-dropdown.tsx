"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { Trophy, Plus, ChevronDown } from "lucide-react";
import { useAuthControllerGetProfile } from "@pokeranking/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const MAX_RANKINGS_SHOWN = 5;

export function RankingsDropdown() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data, isLoading } = useAuthControllerGetProfile();

  const rankings = useMemo(() => data?.data?.rankings ?? [], [data]);
  const username = session?.user?.username ?? "";
  const userRankingsPath = username ? routes.userRankings(username) : "";
  const isActive = pathname.startsWith("/rankings/user");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium hover-scale",
            isActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="h-5 w-5" />
          {t("nav.myRankings")}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={userRankingsPath} className="font-medium">
            <Trophy className="mr-2 h-4 w-4" />
            {t("nav.viewAll")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">
            {t("nav.noRankings")}
          </div>
        ) : (
          <>
            {rankings.slice(0, MAX_RANKINGS_SHOWN).map((ranking) => (
              <DropdownMenuItem key={ranking._id} asChild>
                <Link
                  href={routes.ranking(ranking._id)}
                  className="truncate"
                >
                  {ranking.title}
                </Link>
              </DropdownMenuItem>
            ))}
            {rankings.length > MAX_RANKINGS_SHOWN && (
              <DropdownMenuItem asChild>
                <Link href={userRankingsPath} className="text-primary">
                  {t("nav.viewAllRankings", {
                    count: rankings.length,
                  })}
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.rankingNew}>
            <Plus className="mr-2 h-4 w-4" />
            {t("nav.createNewRanking")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
