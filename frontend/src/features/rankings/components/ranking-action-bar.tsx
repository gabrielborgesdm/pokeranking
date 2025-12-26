"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RankingActionBarProps {
  /** Whether the current user is the owner */
  isOwner: boolean;
  /** Called when edit button is clicked */
  onEditClick?: () => void;
  /** Maximum width for content alignment */
  maxContentWidth?: number;
  /** Optional class name */
  className?: string;
}

/**
 * RankingActionBar - Action bar for ranking view mode
 *
 * Displays a search input (placeholder for future) and edit button (if owner).
 * Shown below the hero section in view mode only.
 */
export const RankingActionBar = memo(function RankingActionBar({
  isOwner,
  onEditClick,
  maxContentWidth,
  className,
}: RankingActionBarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex justify-center px-4", className)}>
      <div
        className="flex items-center justify-between gap-4 w-full py-3 px-4 rounded-xl bg-card/70 border border-border/40"
        style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
      >
        {/* Search input (placeholder for future implementation) */}
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="..."
            disabled
            className="w-full"
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
  );
});
