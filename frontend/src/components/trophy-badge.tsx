"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
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
  pokemonCount: number;
  size?: number;
  className?: string;
}

export const TrophyBadge = memo(function TrophyBadge({
  pokemonCount,
  size = 12,
  className,
}: TrophyBadgeProps) {
  const { t } = useTranslation();

  const trophy = useMemo(() => getTrophy(pokemonCount), [pokemonCount]);
  const nextTrophy = useMemo(() => getNextTrophy(pokemonCount), [pokemonCount]);

  const progressPercentage = useMemo(() => {
    if (!nextTrophy) return 100;
    const currentThreshold = TROPHY_THRESHOLDS[trophy.tier as keyof typeof TROPHY_THRESHOLDS];
    const range = nextTrophy.threshold - currentThreshold;
    const progress = pokemonCount - currentThreshold;
    return Math.min(100, (progress / range) * 100);
  }, [pokemonCount, trophy.tier, nextTrophy]);

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
          <p className="text-xs opacity-80">{pokemonCount} Pokemon</p>
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
            <p className="text-xs opacity-80">{t("trophy.maxTier")}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});
