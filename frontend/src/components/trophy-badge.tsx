"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Sparkles } from "lucide-react";
import {
  getTrophy,
  getNextTrophy,
  TROPHY_THRESHOLDS,
} from "@pokeranking/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface TrophyBadgeProps {
  userTotalRankedPokemon: number;
  size?: number;
  className?: string;
}

export const TrophyBadge = memo(function TrophyBadge({
  userTotalRankedPokemon,
  size = 12,
  className,
}: TrophyBadgeProps) {
  const { t } = useTranslation();

  const trophy = useMemo(() => getTrophy(userTotalRankedPokemon), [userTotalRankedPokemon]);
  const nextTrophy = useMemo(() => getNextTrophy(userTotalRankedPokemon), [userTotalRankedPokemon]);

  const progressPercentage = useMemo(() => {
    if (!nextTrophy) return 100;
    const currentThreshold = TROPHY_THRESHOLDS[trophy.tier as keyof typeof TROPHY_THRESHOLDS];
    const range = nextTrophy.threshold - currentThreshold;
    const progress = userTotalRankedPokemon - currentThreshold;
    return Math.min(100, (progress / range) * 100);
  }, [userTotalRankedPokemon, trophy.tier, nextTrophy]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <Trophy
            style={{
              color: trophy.color,
            }}
            size={size}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3">
        <div className="space-y-2">
          <p className="font-medium">
            {t(`trophy.${trophy.tier}`)}
          </p>
          <p className="text-xs opacity-80">
            {t("trophy.totalRanked", { count: userTotalRankedPokemon })}
          </p>
          {nextTrophy ? (
            <>
              <p className="text-xs opacity-80">
                {t("trophy.nextTier", {
                  remaining: nextTrophy.remaining,
                  tier: t(`trophy.${nextTrophy.nextTier}`),
                })}
              </p>
              <Progress value={progressPercentage} className="h-2" />
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-500">
              <Sparkles size={14} />
              <p className="text-xs font-semibold">{t("trophy.maxTier")}</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});
