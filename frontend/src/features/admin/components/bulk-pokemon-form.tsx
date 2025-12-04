"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Trash2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkPokemon } from "../hooks/use-bulk-pokemon";
import { BulkPokemonItem } from "./bulk-pokemon-item";

const ALLOWED_TYPES = {
  "image/png": [".png"],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function BulkPokemonForm() {
  const { t } = useTranslation();
  const {
    items,
    addFiles,
    updateItemName,
    updateItemTypes,
    updateItem,
    removeItem,
    clearAll,
    submit,
    retryItem,
    retryAllFailed,
    isSubmitting,
    hasItems,
    hasErrors,
    errorCount,
  } = useBulkPokemon();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
    disabled: isSubmitting,
  });

  const firstErrorId = items.find((item) => item.error)?.id;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("admin.pokemon.bulkTitle")}</CardTitle>
        <div className="flex gap-2">
          {hasErrors && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryAllFailed}
              disabled={isSubmitting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("admin.pokemon.retryAllFailed", { count: errorCount })}
            </Button>
          )}
          {hasItems && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("admin.pokemon.clearAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              {t("admin.pokemon.bulkDragDrop")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("admin.pokemon.allowedTypes")}
            </p>
          </div>
        </div>

        {/* Items List */}
        {hasItems && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {hasErrors
                ? t("admin.pokemon.bulkItemCountWithErrors", {
                  count: items.length,
                  errors: errorCount,
                })
                : t("admin.pokemon.bulkItemCount", { count: items.length })}
            </div>
            {items.map((item) => (
              <BulkPokemonItem
                key={item.id}
                item={item}
                onNameChange={(name) => updateItemName(item.id, name)}
                onTypesChange={(types) => updateItemTypes(item.id, types)}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onRemove={() => removeItem(item.id)}
                onRetry={() => retryItem(item.id)}
                disabled={isSubmitting}
                shouldScrollTo={item.id === firstErrorId}
              />
            ))}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={submit}
          disabled={!hasItems || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting
            ? t("admin.pokemon.bulkSubmitting")
            : t("admin.pokemon.bulkSubmit", { count: items.length })}
        </Button>
      </CardContent>
    </Card>
  );
}
