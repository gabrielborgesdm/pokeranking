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
          "flex items-center gap-2 sm:gap-3 rounded-md transition-colors bg-card border border-border/50",
          isCompact ? "px-3 py-2.5" : "px-4 py-6 mx-5"
        )}
        style={{
          width: isCompact ? width : width - 20,
          borderLeft: `4px solid ${zone.color}`,
        }}
      >
        {/* Zone badge */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm",
            isCompact ? "w-9 h-9 text-sm" : "w-9 h-9 text-sm"
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
              isCompact ? "text-sm" : "text-base"
            )}
          >
            {zone.name}-Tier
          </span>
          <span
            className={cn(
              "text-muted-foreground leading-tight",
              isCompact ? "text-xs" : "text-sm"
            )}
          >
            {pokemon.length} Pokemon
          </span>
        </div>

        {/* Top types preview */}
        {topTypes.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto mr-1 sm:mr-2">
            {topTypes.map((item) => (
              <div
                key={item.type}
                className={cn(
                  "flex items-center gap-0.5 sm:gap-1 rounded-full bg-background/60",
                  isCompact ? "px-1.5 py-1" : "px-2 py-1"
                )}
              >
                <PokemonTypeIcon type={item.type} size={isCompact ? 16 : 16} />
                <span
                  className={cn(
                    "text-muted-foreground tabular-nums",
                    isCompact ? "text-xs" : "text-xs"
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
            isCompact ? "h-8 w-8 p-0" : "h-8 px-2",
            topTypes.length === 0 && "ml-auto"
          )}
          onClick={() => setIsStatsOpen(true)}
        >
          <BarChart3 className={cn(isCompact ? "h-4 w-4" : "h-4 w-4")} />
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
