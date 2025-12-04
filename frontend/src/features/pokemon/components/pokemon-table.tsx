"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/routes";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { getPokemonTypeColor } from "@/lib/pokemon-types";

interface PokemonTableProps {
  pokemon: PokemonResponseDto[];
  isLoading: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}

export const PokemonTable = memo(function PokemonTable({
  pokemon,
  isLoading,
  isDeleting,
  onDelete,
}: PokemonTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <PokemonTableSkeleton />;
  }

  if (pokemon.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("admin.pokemon.noResults")}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">{t("admin.pokemon.image")}</TableHead>
            <TableHead>{t("admin.pokemon.name")}</TableHead>
            <TableHead>{t("admin.pokemon.types")}</TableHead>
            <TableHead className="w-[100px]">{t("admin.pokemon.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pokemon.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <div className="relative h-10 w-10">
                  <Image
                    src={p.image.startsWith("http") ? p.image : `/pokemon/${p.image}`}
                    alt={p.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.types?.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      style={{ backgroundColor: getPokemonTypeColor(type) }}
                      className="text-white text-xs"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={routes.adminPokemonEdit(p._id)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t("admin.pokemon.edit")}</span>
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isDeleting}>
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">{t("admin.pokemon.delete")}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("admin.pokemon.deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("admin.pokemon.deleteConfirmDescription", { name: p.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("admin.pokemon.deleteCancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(p._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("admin.pokemon.deleteConfirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

function PokemonTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-14" />
            </TableHead>
            <TableHead className="w-[100px]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-10 w-10 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
