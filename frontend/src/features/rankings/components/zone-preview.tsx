"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getThemeById, DEFAULT_THEME_ID } from "@pokeranking/shared";
import type { Zone } from "./zone-picker";

interface ZonePreviewProps {
  zones?: Zone[];
  theme: string;
  className?: string;
}

function PokemonSkeleton() {
  return (
    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm" />
  );
}

export const ZonePreview = memo(function ZonePreview({
  zones = [],
  theme,
  className,
}: ZonePreviewProps) {
  const { t } = useTranslation();

  const themeData = useMemo(() => {
    const foundTheme = getThemeById(theme ?? DEFAULT_THEME_ID);
    return foundTheme ?? getThemeById(DEFAULT_THEME_ID)!;
  }, [theme]);

  // Sort zones by start position
  const sortedZones = useMemo(() => {
    return [...zones].sort((a, b) => a.interval[0] - b.interval[0]);
  }, [zones]);

  return (
    <div className={className}>
      <h4 className="text-sm font-medium">{t("zoneEditor.preview")}</h4>
      <p className="text-sm text-muted-foreground mb-3">
        {t("zoneEditor.previewDescription")}
      </p>
      <div className="flex justify-start mt-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl p-4 w-full shadow-xl",
            themeData.gradientClass
          )}
        >
          {/* Header placeholder */}
          <div className="mb-4">
            <div className="w-24 h-3 rounded-full bg-white/30 mb-1.5" />
            <div className="w-16 h-2 rounded-full bg-white/20" />
          </div>

          {/* Zones or empty state */}
          {sortedZones.length === 0 ? (
            <div className="text-center py-6 text-white/60 text-sm">
              {t("zoneEditor.noZones")}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedZones.map((zone, index) => (
                <ZoneBand key={index} zone={zone} />
              ))}
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
});

interface ZoneBandProps {
  zone: Zone;
}

const ZoneBand = memo(function ZoneBand({ zone }: ZoneBandProps) {
  const { t } = useTranslation();
  const intervalText = zone.interval[1] === null
    ? `${zone.interval[0]}+`
    : zone.interval[0] === zone.interval[1]
      ? `#${zone.interval[0]}`
      : `#${zone.interval[0]}-${zone.interval[1]}`;

  // Calculate how many skeleton pokemon to show (max 6)
  const pokemonCount = zone.interval[1] === null
    ? 4
    : Math.min(6, zone.interval[1] - zone.interval[0] + 1);

  return (
    <div className="rounded-lg p-2 backdrop-blur-sm bg-white/10">
      {/* Zone header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ backgroundColor: zone.color }}
        />
        <span className="text-xs font-semibold text-white">
          {zone.name || t("zoneEditor.unnamed")}
        </span>
        <span className="text-xs text-white/60">{intervalText}</span>
      </div>

      {/* Pokemon skeletons */}
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: pokemonCount }).map((_, i) => (
          <PokemonSkeleton key={i} />
        ))}
      </div>
    </div>
  );
});
