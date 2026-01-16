"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus, Upload } from "lucide-react";
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
    <main className="container max-w-8xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title={t("admin.pokemon.title")}
        description={t("admin.pokemon.subtitle", { count: total })}
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild variant="outline">
              <Link href={routes.adminPokemonBulk}>
                <Upload className="h-4 w-4 mr-2" />
                {t("admin.pokemon.bulkCreate")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={routes.adminPokemonNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.pokemon.create")}
              </Link>
            </Button>
          </div>
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
