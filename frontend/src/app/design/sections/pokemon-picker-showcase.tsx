"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PokemonPicker, PokemonDropzone } from "@/features/pokemon-picker";
import { SAMPLE_POKEMON, toApiFormat } from "@/data/sample-pokemon";
import { Button } from "@/components/ui/button";
import type { PokemonResponseDto } from "@pokeranking/api-client";

const samplePokemonData = SAMPLE_POKEMON.map(
  toApiFormat
) as PokemonResponseDto[];

export function PokemonPickerShowcase() {
  const [mode, setMode] = useState<"select" | "drag">("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [droppedPokemon, setDroppedPokemon] = useState<PokemonResponseDto[]>(
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const handleSelect = (pokemon: PokemonResponseDto | null) => {
    setSelectedId(pokemon?._id ?? null);
  };

  const selectedPokemon = samplePokemonData.find((p) => p._id === selectedId);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pokemon Picker</h2>
        <p className="text-muted-foreground">
          Virtualized grid component with select and drag modes. Supports
          fixed columns, selection state, and drag-and-drop with positioning.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "select" ? "default" : "outline"}
          onClick={() => setMode("select")}
        >
          Select Mode
        </Button>
        <Button
          variant={mode === "drag" ? "default" : "outline"}
          onClick={() => setMode("drag")}
        >
          Drag Mode
        </Button>
      </div>

      {/* Select Mode Demo */}
      {mode === "select" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Mode</h3>
          <p className="text-sm text-muted-foreground">
            Click a Pokemon to select/deselect. Disabled Pokemon (Skeledirge,
            Meowscarada, Gholdengo) cannot be selected.
          </p>

          {selectedPokemon && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Selected: {selectedPokemon.name}</p>
            </div>
          )}

          <PokemonPicker
            pokemon={samplePokemonData}
            mode="select"
            selectedId={selectedId}
            disabledIds={originalDisabledIds}
            onSelect={handleSelect}
            columns={4}
            className="border rounded-lg p-4"
          />
        </div>
      )}

      {/* Drag Mode Demo */}
      {mode === "drag" && (
        <DndContext sensors={sensors}>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Drag Mode</h3>
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
                columns={4}
                placeholder="Drag Pokemon here to add them"
              />
            </div>

            <PokemonPicker
              pokemon={samplePokemonData}
              mode="drag"
              disabledIds={pickerDisabledIds}
              columns={4}
              className="border rounded-lg p-4"
            />
          </div>
        </DndContext>
      )}
    </section>
  );
}
