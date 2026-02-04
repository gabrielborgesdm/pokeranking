"use client";

import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, ChevronDown } from "lucide-react";
import type { PokemonType } from "@pokeranking/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TypeSelector } from "./type-selector";
import { TypeEffectivenessDisplay } from "./type-effectiveness-display";

export const TypeEffectivenessCalculator = memo(
  function TypeEffectivenessCalculator() {
    const { t } = useTranslation();
    const [primaryType, setPrimaryType] = useState<PokemonType | null>(null);
    const [secondaryType, setSecondaryType] = useState<PokemonType | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const types = [primaryType, secondaryType].filter(
      (t): t is PokemonType => t !== null
    );

    const handleClearAll = () => {
      setPrimaryType(null);
      setSecondaryType(null);
    };

    const hasTypes = types.length > 0;

    const content = (
      <>
        {/* Type Selectors */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
          <TypeSelector
            value={primaryType}
            onChange={(type) => {
              setPrimaryType(type);
              if (!type) setSecondaryType(null);
            }}
            label={t("pokedex.typeCalculator.primaryType")}
            className="flex-1 sm:flex-none"
          />
          <TypeSelector
            value={secondaryType}
            onChange={setSecondaryType}
            label={t("pokedex.typeCalculator.secondaryType")}
            disabled={!primaryType}
            className="flex-1 sm:flex-none"
          />
          {hasTypes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-foreground gap-1.5 h-10 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              <span className="sm:inline">{t("pokedex.typeCalculator.clearAll")}</span>
            </Button>
          )}
        </div>

        {/* Type Effectiveness Results */}
        {hasTypes && (
          <TypeEffectivenessDisplay types={types} />
        )}
      </>
    );

    return (
      <Card className="overflow-hidden">
        {/* Mobile: Collapsible */}
        <div className="sm:hidden">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 px-4 pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t("pokedex.typeCalculator.title")}</CardTitle>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <CardDescription className="text-xs">
                  {t("pokedex.typeCalculator.description")}
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 px-4 pb-4">
                {content}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: Always open */}
        <div className="hidden sm:block">
          <CardHeader className="pb-4 px-6 pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t("pokedex.typeCalculator.title")}</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {t("pokedex.typeCalculator.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            {content}
          </CardContent>
        </div>
      </Card>
    );
  }
);
