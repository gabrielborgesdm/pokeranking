"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Search, ListOrdered } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  isSearchEnabled = false,
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
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full py-4 sm:py-5 mt-6 sm:mt-8 px-3 sm:px-4 rounded-xl bg-card/80 border border-border/50 shadow-sm backdrop-blur-sm"
          style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
        >
          {/* Search input - opens search overlay */}
          <div className="flex-1 sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("rankingView.searchPlaceholder")}
              readOnly
              disabled={!isSearchEnabled}
              onClick={isSearchEnabled ? openSearch : undefined}
              className="w-full pl-9 cursor-pointer bg-background/50"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            {/* Owner-only actions */}
            {isOwner && (
              <>
                {/* Rank Pokemon - enters drag-and-drop mode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleRankPokemon}
                    >
                      <ListOrdered className="h-4 w-4" />
                      <span className="sr-only">
                        {t("rankingView.rankPokemon")}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("rankingView.rankPokemon")}</TooltipContent>
                </Tooltip>

                {/* Edit settings - goes to edit page */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleEditSettings}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">
                        {t("rankingView.editSettings")}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("rankingView.editSettings")}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Share button - visible to all */}
            <ShareButton rankingId={rankingId} rankingTitle={rankingTitle} />

            {/* Export button - visible to all */}
            <ExportButton rankingTitle={rankingTitle} pokemon={pokemon} />
          </div>
        </div>
      </div>

      {/* Search overlay dialog */}
      <PokemonSearchOverlay />
    </>
  );
});
