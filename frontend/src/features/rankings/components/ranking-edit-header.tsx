"use client";

import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, AlertCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

interface RankingEditHeaderProps {
  /** Ranking title */
  title: string;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Called when discard button is clicked */
  onDiscardClick?: () => void;
  /** Called when save button is clicked */
  onSaveClick?: () => void;
  /** Maximum width for content alignment */
  maxContentWidth?: number;
  /** Optional class name */
  className?: string;
}

/**
 * RankingEditHeader - Header for ranking edit mode
 *
 * Displays ranking title, search input (placeholder), unsaved changes indicator,
 * and save/discard buttons. No theming - clean, functional design.
 */
export const RankingEditHeader = memo(function RankingEditHeader({
  title,
  hasUnsavedChanges = false,
  isSaving = false,
  onDiscardClick,
  onSaveClick,
  maxContentWidth,
  className,
}: RankingEditHeaderProps) {
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
    <>
      <header
        className={cn(
          "flex justify-center py-4 px-4 md:px-8 border-b border-border/40 bg-card/70",
          className
        )}
      >
        <div
          className="flex items-center justify-between gap-4 w-full"
          style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
        >
          {/* Left section: Title */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
          </div>

          {/* Center section: Search input (placeholder) */}
          <div className="flex-1 hidden sm:flex max-w-md">
            <Input
              type="text"
              placeholder="..."
              disabled
              className="w-full"
            />
          </div>

          {/* Right section: Unsaved indicator + Save/Discard buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden md:inline">{t("rankingView.unsavedChanges")}</span>
              </div>
            )}

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
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title={t("rankingView.discardConfirmTitle")}
        description={t("rankingView.discardConfirmDescription")}
        confirmLabel={t("rankingView.discardChanges")}
        variant="destructive"
        onConfirm={handleConfirmDiscard}
      />
    </>
  );
});
