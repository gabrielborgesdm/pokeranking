"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PokemonTable,
  PokemonFilters,
  usePokemonList,
} from "@/features/pokemon";
import { routes } from "@/lib/routes";

export default function AdminPokemonPage() {
  const { t } = useTranslation();
  const {
    pokemon,
    total,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    order,
    selectedTypes,
    isLoading,
    isDeleting,
    handleSearchChange,
    handleSortByChange,
    handleOrderChange,
    handleTypesChange,
    handlePageChange,
    handleDelete,
  } = usePokemonList({ initialLimit: 10 });

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.pokemon.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.pokemon.subtitle", { count: total })}
          </p>
        </div>
        <Button asChild>
          <Link href={routes.adminPokemonNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.pokemon.create")}
          </Link>
        </Button>
      </div>

      <PokemonFilters
        searchValue={search}
        sortBy={sortBy}
        order={order}
        selectedTypes={selectedTypes}
        onSearchChange={handleSearchChange}
        onSortByChange={handleSortByChange}
        onOrderChange={handleOrderChange}
        onTypesChange={handleTypesChange}
      />

      <PokemonTable
        pokemon={pokemon}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("admin.pokemon.showing", {
              from: (page - 1) * limit + 1,
              to: Math.min(page * limit, total),
              total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("admin.pokemon.previous")}
            </Button>
            <span className="text-sm">
              {t("admin.pokemon.pageOf", { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {t("admin.pokemon.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
