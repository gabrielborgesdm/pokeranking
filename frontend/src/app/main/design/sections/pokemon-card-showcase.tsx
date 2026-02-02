"use client";

import { PokemonCard, PokemonCardSkeleton, PokemonType } from "@/features/pokemon";

const mockPokemon: {
  name: string;
  image: string;
  types: PokemonType[];
}[] = [
    {
      name: "Fuecoco",
      image: "/pokemon/fuecoco.png",
      types: ["fire"],
    },
    {
      name: "Gengar",
      image: "/pokemon/gengar.png",
      types: ["ghost", "poison"],
    },
    {
      name: "Pikachu",
      image: "/pokemon/pikachu.png",
      types: ["electric"],
    },
    {
      name: "Bulbasaur",
      image: "/pokemon/bulbasaur.png",
      types: ["grass", "poison"],
    },
    {
      name: "Dragonite",
      image: "/pokemon/dragonite.png",
      types: ["dragon", "flying"],
    },
    {
      name: "Alakazam",
      image: "/pokemon/alakazam.png",
      types: ["psychic"],
    },
  ];

export function PokemonCardShowcase() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pokemon Cards</h2>
        <p className="text-muted-foreground">
          Pokemon cards with type-based gradient backgrounds and type icons with
          translated tooltips
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            image={pokemon.image}
            types={pokemon.types}
            onClick={() => console.log(`Clicked ${pokemon.name}`)}
          />
        ))}
      </div>

      {/* Skeleton Loading States */}
      <div>
        <h3 className="text-xl font-bold mb-4">Loading States</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <PokemonCardSkeleton />
          <PokemonCardSkeleton />
          <PokemonCardSkeleton />
          <PokemonCardSkeleton />
        </div>
      </div>
    </section>
  );
}
