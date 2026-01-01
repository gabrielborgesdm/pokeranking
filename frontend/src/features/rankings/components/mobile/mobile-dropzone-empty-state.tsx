"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileDropzoneEmptyStateProps {
  isOver: boolean;
  onShowTutorial: () => void;
  minHeight?: number | string;
}

export const MobileDropzoneEmptyState = memo(function MobileDropzoneEmptyState({
  isOver,
  onShowTutorial,
  minHeight = 150,
}: MobileDropzoneEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className='p-4'>
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 gap-5 p-6",
          isOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        )}
      >
        {isOver ? (
          <p className="text-sm text-primary font-medium">
            {t("rankingView.releaseToAdd", "Release to add!")}
          </p>
        ) : (
          <>
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
              <Hand className="w-8 h-8 text-muted-foreground/70" />
            </div>

            {/* Text */}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground/80">
                {t("rankingView.dropPokemonHere", "Drop Pokemon here")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "mobileRankingTutorial.step2Desc",
                  "Long press on a Pokemon card in the box, then drag it to add to your ranking"
                )}
              </p>
            </div>

            {/* Tutorial button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTutorial}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              {t("mobileRankingTutorial.showTutorial", "How it works")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
