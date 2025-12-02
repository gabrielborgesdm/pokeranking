"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";

export type PokemonTypeVariant =
  | "grass"
  | "water"
  | "fire"
  | "electric"
  | "special";

interface UserCardProps {
  rank: number;
  username: string;
  avatarUrl?: string;
  totalScore: number;
  variant?: PokemonTypeVariant;
  className?: string;
}

const variantClasses: Record<PokemonTypeVariant, string> = {
  grass: "gradient-type-grass",
  water: "gradient-type-water",
  fire: "gradient-type-fire",
  electric: "gradient-type-electric",
  special: "gradient-type-special",
};

export const UserCard = memo(function UserCard({
  rank,
  username,
  avatarUrl,
  totalScore,
  variant = "water",
  className,
}: UserCardProps) {
  const formattedScore = useMemo(
    () => totalScore.toLocaleString(),
    [totalScore]
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 min-w-[280px] shadow-lg transition-transform hover:scale-105",
        variantClasses[variant],
        className
      )}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4">
        <span className="text-4xl font-black opacity-90">#{rank}</span>
      </div>

      {/* Avatar */}
      <div className="absolute top-4 right-4">
        <Avatar className="h-16 w-16 border-2 border-white/30 shadow-md">
          <AvatarImage src={`/pokemon/${avatarUrl}`} alt={username} />
        </Avatar>
      </div>

      {/* Content */}
      <div className="mt-16 space-y-2">
        <h3 className="text-2xl font-bold truncate">{username}</h3>
        <div className="space-y-1">
          <p className="text-sm opacity-80 font-medium">Total Score</p>
          <p className="text-3xl font-black">{formattedScore}</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
    </div>
  );
});
