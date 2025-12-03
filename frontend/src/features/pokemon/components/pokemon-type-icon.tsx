"use client";

import Image from "next/image";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PokemonType, pokemonTypeImages } from "@/lib/pokemon-types";

interface PokemonTypeIconProps {
  type: PokemonType;
  size?: number;
  className?: string;
}

export const PokemonTypeIcon = memo(function PokemonTypeIcon({
  type,
  size = 24,
  className,
}: PokemonTypeIconProps) {
  const { t } = useTranslation();
  const imageSrc = pokemonTypeImages[type];
  const label = t(`pokemonTypes.${type}`);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative rounded-full overflow-hidden flex-shrink-0",
            className
          )}
          style={{ width: size, height: size }}
        >
          <Image
            src={imageSrc}
            alt={label}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
});
