"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Swords } from "lucide-react";
import type { PokemonType } from "@pokeranking/shared";
import { cn } from "@/lib/utils";
import { useTypeEffectiveness } from "@/hooks/use-type-effectiveness";
import { type TypeMultiplier } from "@/lib/type-effectiveness";
import { PokemonTypeIcon } from "./pokemon-type-icon";
import { pokemonTypeGradients } from "@/lib/pokemon-types";

interface TypeEffectivenessDisplayProps {
  types: PokemonType[];
  compact?: boolean;
  className?: string;
}

interface TypeBadgeProps {
  type: PokemonType;
  multiplier?: number;
  compact?: boolean;
}

/**
 * Format multiplier to user-friendly text
 */
function formatMultiplierText(multiplier: number): string {
  if (multiplier === 4) return "4x";
  if (multiplier === 2) return "2x";
  if (multiplier === 0.5) return "½x";
  if (multiplier === 0.25) return "¼x";
  if (multiplier === 0) return "0x";
  return `${multiplier}x`;
}

const TypeBadge = memo(function TypeBadge({
  type,
  multiplier,
  compact,
}: TypeBadgeProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full text-white font-medium",
        compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        pokemonTypeGradients[type]
      )}
    >
      <PokemonTypeIcon type={type} size={compact ? 14 : 16} showTooltip={false} />
      <span>{t(`pokemonTypes.${type}`)}</span>
      {multiplier !== undefined && (
        <span className="ml-0.5 text-white/80 font-bold text-xs">
          {formatMultiplierText(multiplier)}
        </span>
      )}
    </div>
  );
});

interface TypeListProps {
  types: PokemonType[];
  compact?: boolean;
}

const TypeList = memo(function TypeList({ types, compact }: TypeListProps) {
  if (types.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <TypeBadge key={type} type={type} compact={compact} />
      ))}
    </div>
  );
});

interface TypeMultiplierListProps {
  items: TypeMultiplier[];
  compact?: boolean;
}

const TypeMultiplierList = memo(function TypeMultiplierList({
  items,
  compact,
}: TypeMultiplierListProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ type, multiplier }) => (
        <TypeBadge key={type} type={type} multiplier={multiplier} compact={compact} />
      ))}
    </div>
  );
});

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  compact?: boolean;
}

const Section = memo(function Section({ title, subtitle, children, compact }: SectionProps) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div>
        <h4
          className={cn(
            "font-medium",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
});

export const TypeEffectivenessDisplay = memo(function TypeEffectivenessDisplay({
  types,
  compact = false,
  className,
}: TypeEffectivenessDisplayProps) {
  const { t } = useTranslation();
  const effectiveness = useTypeEffectiveness(types);

  if (types.length === 0) return null;

  const hasDefensiveData =
    effectiveness.weaknesses.length > 0 ||
    effectiveness.resistances.length > 0 ||
    effectiveness.immunities.length > 0;

  const hasOffensiveData =
    effectiveness.superEffective.length > 0 ||
    effectiveness.notVeryEffective.length > 0 ||
    effectiveness.noEffect.length > 0;

  if (!hasDefensiveData && !hasOffensiveData) return null;

  return (
    <div className={cn("space-y-6", compact && "space-y-4", className)}>
      {/* Defensive Section */}
      {hasDefensiveData && (
        <div className={cn("space-y-4", compact && "space-y-3")}>
          <div className="flex items-center gap-2">
            <Shield className={cn("text-blue-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            <h3
              className={cn(
                "font-semibold",
                compact ? "text-sm" : "text-base"
              )}
            >
              {t("pokedex.typeEffectiveness.defensive")}
            </h3>
          </div>

          <div className={cn("grid gap-4", compact ? "gap-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {effectiveness.weaknesses.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.weakTo")}
                subtitle={t("pokedex.typeEffectiveness.weakToHint")}
                compact={compact}
              >
                <TypeMultiplierList items={effectiveness.weaknesses} compact={compact} />
              </Section>
            )}

            {effectiveness.resistances.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.resistantTo")}
                subtitle={t("pokedex.typeEffectiveness.resistantToHint")}
                compact={compact}
              >
                <TypeMultiplierList items={effectiveness.resistances} compact={compact} />
              </Section>
            )}

            {effectiveness.immunities.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.immuneTo")}
                subtitle={t("pokedex.typeEffectiveness.immuneToHint")}
                compact={compact}
              >
                <TypeList types={effectiveness.immunities} compact={compact} />
              </Section>
            )}
          </div>
        </div>
      )}

      {/* Offensive Section */}
      {hasOffensiveData && (
        <div className={cn("space-y-4", compact && "space-y-3")}>
          <div className="flex items-center gap-2">
            <Swords className={cn("text-orange-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            <h3
              className={cn(
                "font-semibold",
                compact ? "text-sm" : "text-base"
              )}
            >
              {t("pokedex.typeEffectiveness.offensive")}
            </h3>
          </div>

          <div className={cn("grid gap-4", compact ? "gap-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {effectiveness.superEffective.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.superEffective")}
                subtitle={t("pokedex.typeEffectiveness.superEffectiveHint")}
                compact={compact}
              >
                <TypeList types={effectiveness.superEffective} compact={compact} />
              </Section>
            )}

            {effectiveness.notVeryEffective.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.notVeryEffective")}
                subtitle={t("pokedex.typeEffectiveness.notVeryEffectiveHint")}
                compact={compact}
              >
                <TypeList types={effectiveness.notVeryEffective} compact={compact} />
              </Section>
            )}

            {effectiveness.noEffect.length > 0 && (
              <Section
                title={t("pokedex.typeEffectiveness.noEffect")}
                subtitle={t("pokedex.typeEffectiveness.noEffectHint")}
                compact={compact}
              >
                <TypeList types={effectiveness.noEffect} compact={compact} />
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
