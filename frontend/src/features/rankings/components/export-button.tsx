"use client";

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { PokemonResponseDto } from "@pokeranking/api-client";

interface ExportButtonProps {
  rankingTitle: string;
  pokemon: PokemonResponseDto[];
}

interface ExportPokemon {
  position: number;
  pokedexNumber: number | undefined;
  name: string;
  types: string[];
}

export const ExportButton = memo(function ExportButton({
  rankingTitle,
  pokemon,
}: ExportButtonProps) {
  const { t } = useTranslation();

  const prepareExportData = useCallback((): ExportPokemon[] => {
    return pokemon.map((p, index) => ({
      position: index + 1,
      pokedexNumber: p.pokedexNumber,
      name: p.name,
      types: p.types,
    }));
  }, [pokemon]);

  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const sanitizeFilename = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const handleExportCsv = useCallback(() => {
    const data = prepareExportData();
    const headers = ["Position", "Pokedex #", "Name", "Types"];
    const rows = data.map((p) => [
      p.position,
      p.pokedexNumber ?? "",
      p.name,
      p.types.join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const filename = `${sanitizeFilename(rankingTitle)}-ranking.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8");
    toast.success(t("rankingView.exportSuccess"));
  }, [prepareExportData, sanitizeFilename, rankingTitle, downloadFile, t]);

  const handleExportJson = useCallback(() => {
    const data = prepareExportData();
    const exportObject = {
      title: rankingTitle,
      exportedAt: new Date().toISOString(),
      pokemon: data,
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    const filename = `${sanitizeFilename(rankingTitle)}-ranking.json`;
    downloadFile(jsonContent, filename, "application/json");
    toast.success(t("rankingView.exportSuccess"));
  }, [prepareExportData, sanitizeFilename, rankingTitle, downloadFile, t]);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Download className="h-4 w-4" />
              <span className="sr-only">{t("rankingView.export")}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("rankingView.export")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv}>
          <FileSpreadsheet className="h-4 w-4" />
          {t("rankingView.exportCsv")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJson}>
          <FileJson className="h-4 w-4" />
          {t("rankingView.exportJson")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
