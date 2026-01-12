"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Search, ListOrdered } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { usePokemonSearchContext } from "@/features/pokemon-search/context/pokemon-search-context";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";
import { ShareButton } from "./share-button";
import { ExportButton } from "./export-button";
import type { PokemonResponseDto } from "@pokeranking/api-client";

interface RankingActionBarProps {
  /** Ranking ID for share URL and navigation */
  rankingId: string;
  /** Ranking title for sharing/export */
  rankingTitle: string;
  /** Pokemon list for export */
  pokemon: PokemonResponseDto[];
  /** Whether the current user is the owner */
  isOwner: boolean;
  /** Maximum width for content alignment */
  maxContentWidth?: number;
  /** Optional class name */
  className?: string;
  /** Whether search is enabled (e.g., ranking has Pokemon to search) */
  isSearchEnabled?: boolean;
}

/**
 * RankingActionBar - Action bar for ranking view mode
 *
 * Displays search, share, export, and owner actions.
 * Shown below the hero section in view mode only.
 */
export const RankingActionBar = memo(function RankingActionBar({
  rankingId,
  rankingTitle,
  pokemon,
  isOwner,
  maxContentWidth,
  className,
  isSearchEnabled = true,
}: RankingActionBarProps) {
  const { t } = useTranslation();
  const { openSearch } = usePokemonSearchContext();
  const router = useRouter();

  const handleEditSettings = () => {
    router.push(routes.rankingEdit(rankingId));
  };

  const handleRankPokemon = () => {
    router.push(routes.rankingRank(rankingId));
  };

  return (
    <>
      <div className={cn("flex justify-center px-4 sm:px-0", className)}>
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full  mt-8 px-3 sm:px-4 rounded-lg bg-card border border-border/50 py-4"
          style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
        >
          {/* Search input - opens search overlay */}
          <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              readOnly
              onClick={isSearchEnabled ? openSearch : undefined}
              disabled={!isSearchEnabled}
              placeholder={t("rankingView.searchPlaceholder")}
              className="w-full h-10 pl-9 pr-3 rounded-md border bg-background shadow-xs dark:bg-input/30 dark:border-input text-sm font-normal outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-default"
            />
          </div>

          {/* Action buttons - grid on mobile, flex on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {/* Owner-only actions */}
            {isOwner && (
              <>
                {/* Rank Pokemon - enters drag-and-drop mode */}
                <Button
                  variant="outline"
                  onClick={handleRankPokemon}
                  className="gap-2 h-10 sm:w-auto font-normal"
                >
                  <ListOrdered className="h-4 w-4 shrink-0" />
                  <span className="truncate sm:hidden lg:inline">
                    {t("rankingView.rankPokemon")}
                  </span>
                  <span className="sr-only sm:not-sr-only lg:sr-only">
                    {t("rankingView.rankPokemon")}
                  </span>
                </Button>

                {/* Edit settings - goes to edit page */}
                <Button
                  variant="outline"
                  onClick={handleEditSettings}
                  className="gap-2 h-10 sm:w-auto font-normal"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  <span className="truncate sm:hidden lg:inline">
                    {t("rankingView.editSettings")}
                  </span>
                  <span className="sr-only sm:not-sr-only lg:sr-only">
                    {t("rankingView.editSettings")}
                  </span>
                </Button>
              </>
            )}

            {/* Share button - visible to all */}
            <ShareButton rankingId={rankingId} rankingTitle={rankingTitle} />

            {/* Export button - visible to all */}
            <ExportButton rankingId={rankingId} rankingTitle={rankingTitle} pokemon={pokemon} />
          </div>
        </div>
      </div>

      {/* Search overlay dialog */}
      <PokemonSearchOverlay />
    </>
  );
});
