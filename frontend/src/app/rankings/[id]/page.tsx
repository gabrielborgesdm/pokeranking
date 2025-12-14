"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { DndContext } from "@dnd-kit/core";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PokemonDropzone,
  PokemonBoxes,
  PickerDropzoneLayout,
} from "@/features/pokemon-picker";
import { useRanking } from "@/hooks/use-ranking";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);

  const {
    ranking,
    pokemon,
    setPokemon,
    initialPokemonIds,
    positionColors,
    isLoading,
    notFound: rankingNotFound,
    sensors,
  } = useRanking({ id });

  // Derive filtered and disabled IDs from current pokemon state
  const { filteredOutIds, disabledIds } = useMemo(() => {
    const currentIds = pokemon.map((p) => p._id);

    return {
      // Saved Pokemon (from initial load) should be filtered out (hidden)
      filteredOutIds: currentIds.filter((id) => initialPokemonIds.has(id)),
      // Draft Pokemon (added after load) should be disabled (grayed out)
      disabledIds: currentIds.filter((id) => !initialPokemonIds.has(id)),
    };
  }, [pokemon, initialPokemonIds]);

  if (rankingNotFound) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4">
      {isLoading || !ranking ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{ranking.title}</h1>
            {ranking.user && (
              <p className="text-muted-foreground">by {ranking.user.username}</p>
            )}
          </div>

          <DndContext sensors={sensors}>
            <PickerDropzoneLayout
              dropzone={
                <PokemonDropzone
                  id="ranking-pokemon"
                  pokemon={pokemon}
                  onChange={setPokemon}
                  positionColors={positionColors}
                  maxColumns={5}
                  maxHeight="75vh"
                />
              }
              picker={
                <PokemonBoxes
                  disabledIds={disabledIds}
                  filteredOutIds={filteredOutIds}
                  maxColumns={5}
                  height="75vh"
                />
              }
            />
          </DndContext>
        </div>
      )}
    </main>
  );
}
