"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DraggablePokemonGallery, PokemonDropzone } from "@/features/pokemon-picker";
import { SAMPLE_POKEMON, toApiFormat } from "@/data/sample-pokemon";
import { Button } from "@/components/ui/button";
import type { PokemonResponseDto } from "@pokeranking/api-client";

const samplePokemonData = SAMPLE_POKEMON.map(
  toApiFormat
) as PokemonResponseDto[];

export function PokemonPickerShowcase() {
  const [droppedPokemon, setDroppedPokemon] = useState<PokemonResponseDto[]>(
    []
  );

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

  // Original disabled Pokemon (cannot be dragged at all)
  const originalDisabledIds = ["sample-003", "sample-006", "sample-017"];

  // Combined disabled IDs: original disabled + already in dropzone
  const pickerDisabledIds = useMemo(() => {
    const droppedIds = droppedPokemon.map((p) => p._id);
    return [...originalDisabledIds, ...droppedIds];
  }, [droppedPokemon]);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pokemon Picker</h2>
        <p className="text-muted-foreground">
          Virtualized grid component with drag-and-drop functionality. Supports
          fixed columns and drag-and-drop with positioning.
        </p>
      </div>

      <DndContext sensors={sensors}>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Drag Pokemon to the drop zone. Drop on a specific Pokemon to
            insert before it. Reorder by dragging within the zone. Already
            dropped Pokemon are disabled in the picker.
          </p>

          {/* Drop Zone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Drop Zone{" "}
                {droppedPokemon.length > 0 && (
                  <span className="text-muted-foreground font-normal">
                    ({droppedPokemon.length} Pokemon)
                  </span>
                )}
              </h4>
              {droppedPokemon.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDroppedPokemon([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            <PokemonDropzone
              id="pokemon-dropzone"
              pokemon={droppedPokemon}
              onChange={setDroppedPokemon}
              allPokemon={samplePokemonData}
              maxColumns={4}
              placeholder="Drag Pokemon here to add them"
            />
          </div>

          <DraggablePokemonGallery
            pokemon={samplePokemonData}
            disabledIds={pickerDisabledIds}
            maxColumns={4}
            className="border rounded-lg p-4"
          />
        </div>
      </DndContext>
    </section>
  );
}
