"use client";

import { memo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePokemonSearchContext } from "../context/pokemon-search-context";
import { PokemonSearchResultItem } from "./pokemon-search-result-item";

/**
 * Search overlay dialog for finding Pokemon in a ranking
 */
export const PokemonSearchOverlay = memo(function PokemonSearchOverlay() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen,
    searchQuery,
    results,
    closeSearch,
    setSearchQuery,
    selectResult,
  } = usePokemonSearchContext();

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelectResult = (result: (typeof results)[0]) => {
    selectResult(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("search.title", "Find Pokemon")}</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.placeholder", "Search by name...")}
            className="pl-9"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] space-y-1 mt-2">
          {results.length > 0 ? (
            results.map((result) => (
              <PokemonSearchResultItem
                key={result.pokemon._id}
                result={result}
                onClick={() => handleSelectResult(result)}
              />
            ))
          ) : searchQuery.trim() ? (
            <p className="text-center text-muted-foreground py-8">
              {t("search.noResults", "No Pokemon found")}
            </p>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t("search.startTyping", "Start typing to search...")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
