"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { PokemonImage } from "@/components/pokemon-image";
import { PokemonType, pokemonTypeGradients } from "@/lib/pokemon-types";
import { PokemonTypeIcon } from "./pokemon-type-icon";

interface PokemonCardProps {
  name: string;
  image: string;
  types: PokemonType[];
  onClick?: () => void;
  className?: string;
}

export const PokemonCard = memo(function PokemonCard({
  name,
  image,
  types,
  onClick,
  className,
}: PokemonCardProps) {
  const primaryType = types[0];
  const gradientClass = primaryType ? pokemonTypeGradients[primaryType] : "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 min-w-[200px] shadow-lg",
        onClick && "hover:cursor-pointer",
        gradientClass,
        className
      )}
    >
      {/* Pokemon Image */}
      <div className="relative w-full aspect-square mb-3">
        <PokemonImage
          src={image}
          alt={name}
          fill
          className="drop-shadow-lg"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Pokemon Name */}
      <h3 className="text-xl font-bold text-center truncate mb-2">{name}</h3>

      {/* Type Icons */}
      <div className="flex justify-center gap-2 h-7">
        {types.map((type) => (
          <PokemonTypeIcon key={type} type={type} size={28} />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
    </div>
  );
});
