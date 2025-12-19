"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Pencil, Save, AlertCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface RankingNavbarProps {
  /** Ranking title */
  title: string;
  /** Username of the ranking owner */
  username: string;
  /** Whether the current user is the owner */
  isOwner: boolean;
  /** Whether currently in edit mode */
  isEditMode: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Called when edit button is clicked (view mode) */
  onEditClick?: () => void;
  /** Called when discard button is clicked (edit mode - discards changes) */
  onDiscardClick?: () => void;
  /** Called when save button is clicked (edit mode) */
  onSaveClick?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * RankingNavbar - Top navigation bar for the ranking view page
 *
 * Displays ranking title, owner username, a placeholder search input,
 * and contextual buttons based on mode (edit vs view).
 */
export const RankingNavbar = memo(function RankingNavbar({
  title,
  username,
  isOwner,
  isEditMode,
  hasUnsavedChanges = false,
  isSaving = false,
  onEditClick,
  onDiscardClick,
  onSaveClick,
  className,
}: RankingNavbarProps) {
  const { t } = useTranslation();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleDiscardButtonClick = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      onDiscardClick?.();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    onDiscardClick?.();
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-4 py-4 px-6 border-b border-border/40 rounded-lg bg-card/30",
        className
      )}
    >
      {/* Left section: Title and username */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl font-bold truncate">{title}</h1>
          <Link
            href={routes.userRankings(username)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {username}
          </Link>
        </div>
      </div>

      {/* Center section: Unsaved changes indicator (edit mode) or search placeholder (view mode) */}
      <div className="flex-1 flex items-center justify-end gap-2">
        {isEditMode ? (
          hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("rankingView.unsavedChanges")}</span>
            </div>
          )
        ) : (
          <div className="hidden sm:flex max-w-md">
            <Input
              type="text"
              placeholder="..."
              disabled
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Right section: Edit button (view mode) or Cancel/Discard + Save buttons (edit mode) */}
      <div className="flex items-center gap-2 shrink-0">
        {isEditMode ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardButtonClick}
              disabled={isSaving}
            >
              {hasUnsavedChanges ? (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("rankingView.discardChanges")}</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("common.cancel")}</span>
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSaveClick}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isSaving ? t("common.saving") : t("common.save")}
              </span>
            </Button>
          </>
        ) : (
          isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">{t("rankingView.edit")}</span>
            </Button>
          )
        )}
      </div>

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title={t("rankingView.discardConfirmTitle")}
        description={t("rankingView.discardConfirmDescription")}
        confirmLabel={t("rankingView.discardChanges")}
        variant="destructive"
        onConfirm={handleConfirmDiscard}
      />
    </nav>
  );
});
