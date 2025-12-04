"use client";

import { use } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PokemonForm } from "@/features/admin";
import { usePokemonControllerFindOne } from "@pokeranking/api-client";
import { routes } from "@/lib/routes";

interface EditPokemonPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPokemonEditPage({ params }: EditPokemonPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { data, isLoading, error } = usePokemonControllerFindOne(id);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (error || !data || data.status !== 200) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <PageHeader
          backHref={routes.adminPokemon}
          backLabel={t("admin.pokemon.backToList")}
          title=""
        />
        <div className="text-center py-8 text-muted-foreground">
          {t("admin.pokemon.notFound")}
        </div>
      </main>
    );
  }

  const pokemon = data.data;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <PageHeader
        title={t("admin.pokemon.editTitle")}
        description={t("admin.pokemon.editDescription", { name: pokemon.name })}
        backHref={routes.adminPokemon}
        backLabel={t("admin.pokemon.backToList")}
      />

      <PokemonForm
        mode="edit"
        pokemonId={id}
        initialData={{
          name: pokemon.name,
          image: pokemon.image,
          types: pokemon.types ?? [],
          pokedexNumber: pokemon.pokedexNumber ?? null,
          species: pokemon.species ?? null,
          height: pokemon.height ?? null,
          weight: pokemon.weight ?? null,
          abilities: pokemon.abilities ?? [],
          hp: pokemon.hp ?? null,
          attack: pokemon.attack ?? null,
          defense: pokemon.defense ?? null,
          specialAttack: pokemon.specialAttack ?? null,
          specialDefense: pokemon.specialDefense ?? null,
          speed: pokemon.speed ?? null,
          generation: pokemon.generation ?? null,
        }}
      />
    </main>
  );
}
