"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={routes.adminPokemon}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("admin.pokemon.backToList")}
            </Link>
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          {t("admin.pokemon.notFound")}
        </div>
      </main>
    );
  }

  const pokemon = data.data;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={routes.adminPokemon}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.pokemon.backToList")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{t("admin.pokemon.editTitle")}</h1>
        <p className="text-muted-foreground">
          {t("admin.pokemon.editDescription", { name: pokemon.name })}
        </p>
      </div>

      <PokemonForm
        mode="edit"
        pokemonId={id}
        initialData={{
          name: pokemon.name,
          image: pokemon.image,
        }}
      />
    </main>
  );
}
