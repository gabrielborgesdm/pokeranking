"use client";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";
import { PokemonForm } from "@/features/admin";
import { routes } from "@/lib/routes";

export default function AdminPokemonNewPage() {
  const { t } = useTranslation();

  return (
    <main className="container max-w-8xl mx-auto px-4 py-8 max-w-2xl space-y-6">
      <PageHeader
        title={t("admin.pokemon.createTitle")}
        description={t("admin.pokemon.createDescription")}
        backHref={routes.adminPokemon}
        backLabel={t("admin.pokemon.backToList")}
      />

      <PokemonForm mode="create" />
    </main>
  );
}
