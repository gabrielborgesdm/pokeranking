import { useMemo, useState, useCallback } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useRankingsControllerFindOne,
  type PokemonResponseDto,
  type ZoneResponseDto,
} from "@pokeranking/api-client";

interface UseRankingOptions {
  id: string;
}

export function useRanking({ id }: UseRankingOptions) {
  const { data, isLoading, error } = useRankingsControllerFindOne(id);

  const ranking = useMemo(() => data?.data, [data]);

  const initialPokemon = useMemo<PokemonResponseDto[]>(
    () => ranking?.pokemon ?? [],
    [ranking]
  );

  const [pokemon, setPokemon] = useState<PokemonResponseDto[]>([]);

  // Sync local state with fetched data
  useMemo(() => {
    if (initialPokemon.length > 0 && pokemon.length === 0) {
      setPokemon(initialPokemon);
    }
  }, [initialPokemon, pokemon.length]);

  const handlePokemonChange = useCallback((newPokemon: PokemonResponseDto[]) => {
    setPokemon(newPokemon);
  }, []);

  const zones = useMemo<ZoneResponseDto[]>(() => ranking?.zones ?? [], [ranking]);

  // Build position -> color map based on zones and pokemon count
  const positionColors = useMemo(() => {
    const map = new Map<number, string>();
    const pokemonCount = pokemon.length;

    for (let pos = 1; pos <= pokemonCount; pos++) {
      for (const zone of zones) {
        const [start, end] = zone.interval;
        if (pos >= start && (end === null || pos <= end)) {
          map.set(pos, zone.color);
          break;
        }
      }
    }

    return map;
  }, [zones, pokemon.length]);

  const notFound = error || (data && data.status === 404);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  return {
    ranking,
    pokemon,
    setPokemon: handlePokemonChange,
    positionColors,
    isLoading,
    error,
    notFound,
    sensors,
  };
}
