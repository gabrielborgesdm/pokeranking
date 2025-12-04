"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PokemonForm } from "@/features/admin";
import { routes } from "@/lib/routes";

export default function AdminPokemonNewPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={routes.adminPokemon}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.pokemon.backToList")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{t("admin.pokemon.createTitle")}</h1>
        <p className="text-muted-foreground">
          {t("admin.pokemon.createDescription")}
        </p>
      </div>

      <PokemonForm mode="create" />
    </main>
  );
}
