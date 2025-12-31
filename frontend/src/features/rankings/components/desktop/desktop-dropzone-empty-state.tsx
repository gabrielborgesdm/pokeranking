"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { MousePointerClick, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopDropzoneEmptyStateProps {
  isOver: boolean;
  minHeight?: number | string;
}

export const DesktopDropzoneEmptyState = memo(function DesktopDropzoneEmptyState({
  isOver,
  minHeight = 150,
}: DesktopDropzoneEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4" style={{ height: minHeight }}>
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200",
          isOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
      >
        {isOver ? (
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-primary font-medium">
            {t("rankingView.releaseToAdd", "Release to add!")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Icon with subtle animation */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <MousePointerClick className="w-8 h-8 text-muted-foreground/70" />
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20 animate-ping opacity-20" />
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2 max-w-xs">
            <p className="text-sm font-medium text-foreground/80">
              {t("rankingView.dropPokemonHere", "Drop Pokemon here")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                "desktopRankingHint.dragFromBox",
                "Drag Pokemon from the box on the right to start building your ranking"
              )}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
});
