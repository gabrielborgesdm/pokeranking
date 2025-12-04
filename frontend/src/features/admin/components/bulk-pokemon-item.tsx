"use client";

import { useRef, useEffect, useState } from "react";
import { X, AlertCircle, RotateCcw, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "@pokeranking/shared";
import { cn } from "@/lib/utils";
import { pokemonTypeGradients } from "@/lib/pokemon-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  TypesSelector,
  SelectedTypesBadges,
} from "@/features/pokemon/components/types-selector";
import { PokemonFields } from "./pokemon-fields";
import type { BulkPokemonItem as BulkPokemonItemType } from "../types/bulk-pokemon";

interface BulkPokemonItemProps {
  item: BulkPokemonItemType;
  onNameChange: (name: string) => void;
  onTypesChange: (types: PokemonType[]) => void;
  onUpdate: (updates: Partial<BulkPokemonItemType>) => void;
  onRemove: () => void;
  onRetry: () => void;
  disabled?: boolean;
  shouldScrollTo?: boolean;
}

export function BulkPokemonItem({
  item,
  onNameChange,
  onTypesChange,
  onUpdate,
  onRemove,
  onRetry,
  disabled,
  shouldScrollTo,
}: BulkPokemonItemProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Create blob URL for preview
  useEffect(() => {
    if (!item.error && !item.imageUrl) {
      const url = URL.createObjectURL(item.file);
      setPreviewUrl(url);
      setImageError(false);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.file, item.error, item.imageUrl]);

  useEffect(() => {
    if (shouldScrollTo && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [shouldScrollTo]);

  const handleTypeRemove = (type: PokemonType) => {
    onTypesChange(item.types.filter((t) => t !== type));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine the gradient class based on displayType or first type
  const gradientClass = item.displayType
    ? pokemonTypeGradients[item.displayType]
    : item.types.length > 0
      ? pokemonTypeGradients[item.types[0]]
      : "";

  // Determine what to show in the image area
  const showErrorCard = item.error;
  const showUploadedImage = !item.error && item.imageUrl;
  const showPreview = !item.error && !item.imageUrl && previewUrl && !imageError;
  const showPlaceholder = !showErrorCard && !showUploadedImage && !showPreview;

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-lg border transition-all overflow-hidden",
        item.error
          ? "border-destructive"
          : gradientClass
            ? "border-transparent"
            : "border-border"
      )}
    >
      {/* Gradient Background */}
      {gradientClass && !item.error && (
        <div className={cn("absolute inset-0 opacity-20", gradientClass)} />
      )}

      <div className="relative flex items-start gap-4 p-4">
        {/* Image Preview or Error Card */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {showErrorCard && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 gap-1 p-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={disabled}
                className="h-6 text-xs px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("admin.pokemon.retryUpload")}
              </Button>
            </div>
          )}
          {showUploadedImage && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          {showPreview && (
            <img
              src={previewUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          {showPlaceholder && (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-2">
          {/* Name Input */}
          <Input
            value={item.name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            placeholder={t("admin.pokemon.namePlaceholder")}
            className={cn("bg-background/80", item.error && "border-destructive")}
          />

          {/* Types Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <TypesSelector
              selectedTypes={item.types}
              onTypesChange={onTypesChange}
              disabled={disabled}
              compact
              showClearButton={false}
              className="bg-background/80"
            />

            <SelectedTypesBadges
              selectedTypes={item.types}
              onTypeRemove={handleTypeRemove}
              disabled={disabled}
            />
          </div>

          {/* Expand/Collapse Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
            className="h-6 px-2 text-xs text-muted-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {t("admin.pokemon.hideDetails")}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {t("admin.pokemon.showDetails")}
              </>
            )}
          </Button>

          {/* Error Message */}
          {item.error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {item.error}
            </p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="flex-shrink-0 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Expanded Details */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="relative px-4 pb-4">
          <PokemonFields
            values={item}
            onChange={(field, value) => onUpdate({ [field]: value })}
            disabled={disabled}
            compact
            inputClassName="bg-background/80"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
