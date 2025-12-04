"use client";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";
import { BulkPokemonForm } from "@/features/admin/components/bulk-pokemon-form";
import { routes } from "@/lib/routes";

export default function AdminPokemonBulkPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <PageHeader
        title={t("admin.pokemon.bulkCreateTitle")}
        description={t("admin.pokemon.bulkCreateDescription")}
        backHref={routes.adminPokemon}
        backLabel={t("admin.pokemon.backToList")}
      />

      <BulkPokemonForm />
    </main>
  );
}
