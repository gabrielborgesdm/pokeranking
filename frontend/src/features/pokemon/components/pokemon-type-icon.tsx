"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  PokemonType,
  pokemonTypeImages,
  pokemonTypeColors,
} from "@/lib/pokemon-types";

interface PokemonTypeIconProps {
  type: PokemonType;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

export const PokemonTypeIcon = memo(function PokemonTypeIcon({
  type,
  size = 24,
  className,
  showTooltip = true,
}: PokemonTypeIconProps) {
  const { t } = useTranslation();
  const imageSrc = pokemonTypeImages[type];
  const color = pokemonTypeColors[type];
  const label = t(`pokemonTypes.${type}`);

  const icon = (
    <div
      className={cn("flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${imageSrc})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: `url(${imageSrc})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
      role="img"
      aria-label={label}
    />
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent>
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
});
