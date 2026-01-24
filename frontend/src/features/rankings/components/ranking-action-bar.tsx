"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Search } from "lucide-react";
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
      <div className={cn("flex justify-center px-4 lg:px-0", className)}>
        <div
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-4 w-full mt-8 px-3 lg:px-4 rounded-lg bg-card border border-border/50 py-4"
          style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
        >
          {/* Search input - opens search overlay */}
          <div className="relative w-full lg:flex-1 lg:min-w-[180px]">
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

          {/* Action buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            {/* Owner-only actions */}
            {isOwner && (
              <>
                {/* Rank Pokemon - PRIMARY CTA - enters drag-and-drop mode */}
                <Button
                  onClick={handleRankPokemon}
                  variant="outline"
                  className="gap-2 h-11 lg:h-10 w-full lg:w-auto font-medium "
                >
                  {/* Pokeball icon - red top, white bottom */}
                  <svg
                    viewBox="0 0 100 100"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="50" cy="50" r="48" className="fill-none stroke-current opacity-30" strokeWidth="4" />
                    {/* Top half - red */}
                    <path d="M 50 2 A 48 48 0 0 1 98 50 L 65 50 A 15 15 0 0 0 35 50 L 2 50 A 48 48 0 0 1 50 2 Z" fill="oklch(0.50 0.205 27)" />
                    {/* Bottom half - white */}
                    <path d="M 2 50 A 48 48 0 0 0 50 98 A 48 48 0 0 0 98 50 L 65 50 A 15 15 0 0 1 35 50 Z" className="fill-white" />
                    {/* Middle band - black */}
                    <rect x="2" y="47" width="96" height="6" fill="oklch(0.12 0 0)" />
                    {/* Center button */}
                    <circle cx="50" cy="50" r="15" className="fill-white" stroke="oklch(0.12 0 0)" strokeWidth="3" />
                    <circle cx="50" cy="50" r="6" fill="oklch(0.12 0 0)" opacity="0.3" />
                  </svg>
                  <span>{t("rankingView.rankPokemon")}</span>
                </Button>

                {/* Secondary actions grid on mobile */}
                <div className="grid  lg:flex lg:items-center gap-2">
                  {/* Edit settings - goes to edit page */}
                  <Button
                    variant="outline"
                    onClick={handleEditSettings}
                    className="gap-2 h-10 lg:w-auto font-normal"
                  >
                    <Pencil className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {t("rankingView.editSettings")}
                    </span>
                  </Button>

                  {/* Share button - visible to all */}
                  <ShareButton rankingId={rankingId} rankingTitle={rankingTitle} />

                  {/* Export button - visible to all */}
                  <ExportButton rankingId={rankingId} rankingTitle={rankingTitle} pokemon={pokemon} />
                </div>
              </>
            )}

            {/* Non-owner: Share and Export only */}
            {!isOwner && (
              <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
                <ShareButton rankingId={rankingId} rankingTitle={rankingTitle} />
                <ExportButton rankingId={rankingId} rankingTitle={rankingTitle} pokemon={pokemon} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay dialog */}
      <PokemonSearchOverlay />
    </>
  );
});
