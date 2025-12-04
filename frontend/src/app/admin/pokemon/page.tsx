"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  SimplePagination,
  SimplePaginationSkeleton,
} from "@/components/pagination";
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
    handleLimitChange,
    handleDelete,
  } = usePokemonList({ initialLimit: 10 });

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title={t("admin.pokemon.title")}
        description={t("admin.pokemon.subtitle", { count: total })}
        action={
          <Button asChild>
            <Link href={routes.adminPokemonNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.pokemon.create")}
            </Link>
          </Button>
        }
      />

      <PokemonFilters
        searchValue={search}
        sortBy={sortBy}
        order={order}
        selectedTypes={selectedTypes}
        limit={limit}
        onSearchChange={handleSearchChange}
        onSortByChange={handleSortByChange}
        onOrderChange={handleOrderChange}
        onTypesChange={handleTypesChange}
        onLimitChange={handleLimitChange}
      />

      <PokemonTable
        pokemon={pokemon}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        skeletonRows={limit}
      />

      {isLoading ? (
        <SimplePaginationSkeleton />
      ) : (
        <SimplePagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
