"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonImage } from "@/components/pokemon-image";
import { FullscreenImageDialog } from "@/components/fullscreen-image-dialog";
import { PokemonTypeIcon } from "./pokemon-type-icon";
import { StatBar, getStatColor } from "./stat-bar";
import { TypeEffectivenessDisplay } from "./type-effectiveness-display";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";
import { cn } from "@/lib/utils";
import { normalizePokemonImageSrc } from "@/lib/image-utils";
import { pokemonTypeGradients, type PokemonType } from "@/lib/pokemon-types";
import { usePokemonControllerFindOne } from "@pokeranking/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGeneration } from "@/lib/generation-utils";

interface PokemonDetailsDialogProps {
  pokemonId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DialogSkeleton() {
  return (
    <div className="grid sm:grid-cols-[280px_1fr] gap-6">
      {/* Left column skeleton */}
      <div className="space-y-4">
        {/* Image skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-[220px] h-[220px] rounded-full" />
        </div>

        {/* Name and badges skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="flex justify-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 mx-auto rounded-full" />
        </div>

        {/* Physical Info skeleton */}
        <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 mx-auto" />
            <Skeleton className="h-5 w-12 mx-auto" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 mx-auto" />
            <Skeleton className="h-5 w-12 mx-auto" />
          </div>
        </div>

        {/* Abilities skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right column skeleton */}
      <div className="space-y-4">
        {/* Type effectiveness - Defensive skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-36" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-18 rounded-full" />
                <Skeleton className="h-6 w-22 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Type effectiveness - Offensive skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-22 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="flex-1 h-3 rounded-full" />
                <Skeleton className="w-8 h-4" />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PokemonDetailsDialog = memo(function PokemonDetailsDialog({
  pokemonId,
  open,
  onOpenChange,
}: PokemonDetailsDialogProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  useBackButtonDialog(open, () => onOpenChange(false));

  const { data, isLoading } = usePokemonControllerFindOne(pokemonId ?? "", {
    query: {
      enabled: !!pokemonId && open,
    },
  });

  const pokemon = data?.status === 200 ? data.data : null;
  const primaryType = pokemon?.types?.[0] as PokemonType | undefined;
  const gradientClass = primaryType
    ? pokemonTypeGradients[primaryType]
    : "gradient-pokemon-default";

  const stats = pokemon
    ? [
      { label: "HP", value: pokemon.hp ?? 0, key: "hp" },
      { label: "Attack", value: pokemon.attack ?? 0, key: "attack" },
      { label: "Defense", value: pokemon.defense ?? 0, key: "defense" },
      { label: "Sp. Atk", value: pokemon.specialAttack ?? 0, key: "special-attack" },
      { label: "Sp. Def", value: pokemon.specialDefense ?? 0, key: "special-defense" },
      { label: "Speed", value: pokemon.speed ?? 0, key: "speed" },
    ]
    : [];

  const totalStats = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:h-full max-sm:max-h-full max-sm:rounded-none sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto overflow-x-hidden"
        showCloseButton
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoading || !pokemon ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-[625px]"
            >
              <DialogHeader>
                <DialogTitle className="sr-only">Loading Pokemon</DialogTitle>
              </DialogHeader>
              <DialogSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={pokemon._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 min-h-[625px]"
            >
              <DialogHeader className="sr-only">
                <DialogTitle>{pokemon.name}</DialogTitle>
              </DialogHeader>

              {/* Two-column layout on larger screens */}
              <div className="grid sm:grid-cols-[280px_1fr] gap-6">
                {/* Left column - Image and basic info */}
                <div className="space-y-4">
                  {/* Pokemon Image with gradient background */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className={cn(
                      "relative w-full aspect-square max-w-[220px] mx-auto rounded-full p-4 cursor-zoom-in",
                      gradientClass
                    )}
                    onClick={() => setIsFullscreenOpen(true)}
                  >
                    <div className="relative w-full h-full">
                      <PokemonImage
                        src={pokemon.image}
                        alt={pokemon.name}
                        fill
                        className="drop-shadow-2xl"
                        sizes="220px"
                      />
                    </div>
                    {/* Decorative circles */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white/10"
                    />
                  </motion.div>

                  {/* Name and Pokedex Number */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-center space-y-2"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
                      {pokemon.pokedexNumber && (
                        <span className="text-muted-foreground font-mono text-lg">
                          #{String(pokemon.pokedexNumber).padStart(4, "0")}
                        </span>
                      )}
                    </div>

                    {/* Type Icons */}
                    <div className="flex justify-center gap-2">
                      {pokemon.types?.map((type, index) => (
                        <motion.div
                          key={type}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        >
                          <PokemonTypeIcon
                            type={type as PokemonType}
                            size={32}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Generation Badge */}
                    {pokemon.generation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="flex justify-center"
                      >
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {formatGeneration(pokemon.generation)}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Physical Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="grid grid-cols-3 gap-2 text-center border-t border-border pt-4"
                  >
                    {pokemon.species && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Species
                        </p>
                        <p className="text-sm font-medium">{pokemon.species}</p>
                      </div>
                    )}
                    {pokemon.height !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Height
                        </p>
                        <p className="text-sm font-medium">{(pokemon.height / 10).toFixed(1)}m</p>
                      </div>
                    )}
                    {pokemon.weight !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Weight
                        </p>
                        <p className="text-sm font-medium">{(pokemon.weight / 10).toFixed(1)}kg</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Abilities */}
                  {pokemon.abilities && pokemon.abilities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="space-y-2"
                    >
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Abilities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {pokemon.abilities.map((ability, index) => (
                          <motion.span
                            key={ability}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-muted capitalize"
                          >
                            {ability.replace("-", " ")}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right column - Type Effectiveness and Stats */}
                <div className="space-y-4">
                  {/* Type Matchups */}
                  {pokemon.types && pokemon.types.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <TypeEffectivenessDisplay
                        types={pokemon.types as PokemonType[]}
                        compact
                      />
                    </motion.div>
                  )}

                  {/* Base Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Base Stats
                    </h3>
                    <div className="space-y-2">
                      {stats.map((stat, index) => (
                        <motion.div
                          key={stat.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                        >
                          <StatBar
                            label={stat.label}
                            value={stat.value}
                            color={getStatColor(stat.key)}
                            animate={open}
                          />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      className="flex justify-between items-center pt-2 border-t border-border"
                    >
                      <span className="text-sm font-semibold">Total</span>
                      <span className="text-lg font-bold tabular-nums">{totalStats}</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <FullscreenImageDialog
        src={pokemon?.image ? normalizePokemonImageSrc(pokemon.image) : null}
        alt={pokemon?.name ?? "Pokemon"}
        open={isFullscreenOpen}
        onOpenChange={setIsFullscreenOpen}
      />
    </Dialog>
  );
});
