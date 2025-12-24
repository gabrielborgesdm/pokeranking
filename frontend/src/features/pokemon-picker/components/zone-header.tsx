"use client";

import { memo, useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PokemonTypeIcon } from "@/features/pokemon/components/pokemon-type-icon";
import { ZoneStatsDialog } from "./zone-stats-dialog";
import { calculateZoneStats } from "../utils/zone-stats";
import type { Zone } from "../utils/zone-grouping";
import type { PokemonResponseDto } from "@pokeranking/api-client";

interface ZoneHeaderProps {
  zone: Zone;
  pokemon: PokemonResponseDto[];
  isCompact: boolean;
  width: number;
}

export const ZoneHeader = memo(function ZoneHeader({
  zone,
  pokemon,
  isCompact,
  width,
}: ZoneHeaderProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const stats = useMemo(() => calculateZoneStats(pokemon), [pokemon]);
  const topTypes = stats.topTypes.slice(0, isCompact ? 2 : 3);

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 rounded-lg transition-colors",
          isCompact ? "px-2 py-2" : "px-4 py-8"
        )}
        style={{
          width,
          backgroundColor: `${zone.color}12`,
          borderLeft: `4px solid ${zone.color}`,
        }}
      >
        {/* Zone badge */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-bold text-white shrink-0",
            isCompact ? "w-6 h-6 text-xs" : "w-9 h-9 text-sm"
          )}
          style={{ backgroundColor: zone.color }}
        >
          {zone.name}
        </div>

        {/* Zone name and count */}
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "font-semibold text-foreground leading-tight",
              isCompact ? "text-xs" : "text-base"
            )}
          >
            {zone.name}-Tier
          </span>
          <span
            className={cn(
              "text-muted-foreground leading-tight",
              isCompact ? "text-[10px]" : "text-sm"
            )}
          >
            {pokemon.length} Pokemon
          </span>
        </div>

        {/* Top types preview */}
        {topTypes.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto mr-1 sm:mr-2">
            {topTypes.map((item) => (
              <div
                key={item.type}
                className={cn(
                  "flex items-center gap-0.5 sm:gap-1 rounded-full bg-background/60",
                  isCompact ? "px-1 py-0.5" : "px-2 py-1"
                )}
              >
                <PokemonTypeIcon type={item.type} size={isCompact ? 14 : 16} />
                <span
                  className={cn(
                    "text-muted-foreground tabular-nums",
                    isCompact ? "text-[10px]" : "text-xs"
                  )}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Stats button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "shrink-0",
            isCompact ? "h-6 w-6 p-0" : "h-8 px-2",
            topTypes.length === 0 && "ml-auto"
          )}
          onClick={() => setIsStatsOpen(true)}
        >
          <BarChart3 className={cn(isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </Button>
      </div>

      <ZoneStatsDialog
        zone={zone}
        pokemon={pokemon}
        open={isStatsOpen}
        onOpenChange={setIsStatsOpen}
      />
    </>
  );
});
