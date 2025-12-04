"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RANKING_THEMES,
  isThemeAvailable,
  getThemeUnlockProgress,
  type RankingTheme,
  type ThemeTier,
} from "@pokeranking/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface BackgroundPickerProps {
  value?: string;
  onChange: (themeId: string | undefined) => void;
  pokemonCount: number;
  totalPokemonInSystem: number;
  className?: string;
}

const TIER_ORDER: ThemeTier[] = [
  "starter",
  "intermediate",
  "advanced",
  "premium",
];

export const BackgroundPicker = memo(function BackgroundPicker({
  value,
  onChange,
  pokemonCount,
  totalPokemonInSystem,
  className,
}: BackgroundPickerProps) {
  const { t } = useTranslation();

  const groupedThemes = useMemo(() => {
    const groups: Record<ThemeTier, RankingTheme[]> = {
      starter: [],
      intermediate: [],
      advanced: [],
      premium: [],
    };

    RANKING_THEMES.forEach((theme) => {
      groups[theme.tier].push(theme);
    });

    return groups;
  }, []);

  const renderSameAsCardButton = () => {
    const isSelected = !value;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={cn(
              "relative w-16 h-16 rounded-lg transition-all border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center",
              isSelected &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary",
              "cursor-pointer hover:scale-105 hover:border-muted-foreground/50"
            )}
            aria-label={t("rankingForm.sameAsCard")}
          >
            <Link2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("rankingForm.sameAsCard")}</TooltipContent>
      </Tooltip>
    );
  };

  const renderThemeButton = (theme: RankingTheme) => {
    const available = isThemeAvailable(
      theme.id,
      pokemonCount,
      totalPokemonInSystem
    );
    const isSelected = value === theme.id;
    const progress = getThemeUnlockProgress(
      theme,
      pokemonCount,
      totalPokemonInSystem
    );

    const button = (
      <button
        key={theme.id}
        type="button"
        onClick={() => available && onChange(theme.id)}
        disabled={!available}
        className={cn(
          "relative w-16 h-16 rounded-lg transition-all border-2 border-transparent",
          theme.gradientClass,
          isSelected &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
          available
            ? "cursor-pointer hover:scale-105"
            : "opacity-50 cursor-not-allowed"
        )}
        aria-label={theme.displayName}
      >
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
        )}
      </button>
    );

    if (!available) {
      return (
        <Tooltip key={theme.id}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <p className="font-medium">{theme.displayName}</p>
              <p className="text-xs opacity-80">
                {t("rankingForm.unlockRequirement", {
                  current: progress.current,
                  required: progress.required,
                })}
              </p>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={theme.id}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{theme.displayName}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Same as card option */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">{renderSameAsCardButton()}</div>
      </div>

      {/* Theme options grouped by tier */}
      {TIER_ORDER.map((tier) => {
        const themes = groupedThemes[tier];
        if (themes.length === 0) return null;

        return (
          <div key={tier} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground capitalize">
              {t(`rankingForm.themeTier.${tier}`)}
            </h4>
            <div className="flex flex-wrap gap-3">
              {themes.map(renderThemeButton)}
            </div>
          </div>
        );
      })}
    </div>
  );
});
