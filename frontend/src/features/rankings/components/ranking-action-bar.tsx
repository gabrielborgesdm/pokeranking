"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePokemonSearchContext } from "@/features/pokemon-search/context/pokemon-search-context";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";

interface RankingActionBarProps {
  /** Whether the current user is the owner */
  isOwner: boolean;
  /** Called when edit button is clicked */
  onEditClick?: () => void;
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
 * Displays a search input and edit button (if owner).
 * Shown below the hero section in view mode only.
 */
export const RankingActionBar = memo(function RankingActionBar({
  isOwner,
  onEditClick,
  maxContentWidth,
  className,
  isSearchEnabled = false,
}: RankingActionBarProps) {
  const { t } = useTranslation();
  const { openSearch } = usePokemonSearchContext();

  return (
    <>
      <div className={cn("flex justify-center px-4", className)}>
        <div
          className="flex items-center justify-between gap-4 w-full py-3 mt-8 px-4 rounded-xl bg-card/70 border border-border/40"
          style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
        >
          {/* Search input - opens search overlay */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("search.placeholder", "Search Pokemon...")}
              readOnly
              disabled={!isSearchEnabled}
              onClick={isSearchEnabled ? openSearch : undefined}
              className="w-full pl-9 cursor-pointer"
            />
          </div>

          {/* Edit button (only shown if owner) */}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">{t("rankingView.edit")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search overlay dialog */}
      <PokemonSearchOverlay />
    </>
  );
});
