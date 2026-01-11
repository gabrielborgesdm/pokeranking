"use client";

import { memo, useMemo } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonTypeIcon } from "@/features/pokemon/components/pokemon-type-icon";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";
import { cn } from "@/lib/utils";
import { formatGeneration } from "@/lib/generation-utils";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { calculateZoneStats } from "../utils/zone-stats";
import type { Zone } from "../utils/zone-grouping";
import { useTranslation } from "react-i18next";

interface ZoneStatsDialogProps {
  zone: Zone;
  pokemon: PokemonResponseDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ZoneStatsDialog = memo(function ZoneStatsDialog({
  zone,
  pokemon,
  open,
  onOpenChange,
}: ZoneStatsDialogProps) {
  const { t } = useTranslation();
  const stats = useMemo(() => calculateZoneStats(pokemon), [pokemon]);
  useBackButtonDialog(open, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:h-full max-sm:max-h-full max-sm:rounded-none sm:max-w-lg sm:max-h-[85vh] overflow-y-auto overflow-x-hidden"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: zone.color }}
            >
              {zone.name}
            </div>
            <span>{t("zoneStats.title", { zoneName: zone.name })}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Summary */}
          <div
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: `${zone.color}15` }}
          >
            <p className="text-3xl font-bold" style={{ color: zone.color }}>
              {stats.totalCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("zoneStats.totalPokemon")}
            </p>
          </div>

          {/* Type Distribution */}
          {stats.topTypes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("zoneStats.typeDistribution")}
              </h3>
              <div className="space-y-2">
                {stats.topTypes.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex items-center gap-3"
                  >
                    <PokemonTypeIcon type={item.type} size={24} />
                    <span className="text-sm capitalize flex-1">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(item.count / stats.totalCount) * 100}%`,
                          }}
                          transition={{ duration: 0.4, delay: 0.1 + index * 0.03 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {stats.topTypes.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    {t("zoneStats.moreTypes", {
                      count: stats.topTypes.length - 8,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generation Distribution */}
          {stats.topGenerations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("zoneStats.generationDistribution")}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {stats.topGenerations.map((item, index) => (
                  <motion.div
                    key={item.generation}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      "rounded-lg p-3 text-center border",
                      index === 0 && "border-2"
                    )}
                    style={{
                      borderColor: index === 0 ? zone.color : undefined,
                      backgroundColor: index === 0 ? `${zone.color}10` : undefined,
                    }}
                  >
                    <p className="text-lg font-bold tabular-nums">{item.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatGeneration(item.generation)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
