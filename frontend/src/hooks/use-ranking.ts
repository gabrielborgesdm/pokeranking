import { useMemo } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useRankingsControllerFindOne,
  type PokemonResponseDto,
} from "@pokeranking/api-client";

interface UseRankingOptions {
  id: string;
}

export function useRanking({ id }: UseRankingOptions) {
  const { data, isLoading, error } = useRankingsControllerFindOne(id);

  const ranking = useMemo(() => data?.data, [data]);

  const pokemon = useMemo<PokemonResponseDto[]>(
    () => ranking?.pokemon ?? [],
    [ranking]
  );

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
    isLoading,
    error,
    notFound,
    sensors,
  };
}
