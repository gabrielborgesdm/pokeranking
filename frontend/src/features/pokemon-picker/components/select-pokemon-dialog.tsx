"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectablePokemonGallery } from "./selectable-pokemon-gallery";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";
import type { PokemonResponseDto } from "@pokeranking/api-client";

export interface SelectPokemonDialogProps {
  /**
   * Controls whether the dialog is open
   */
  open: boolean;
  /**
   * Callback when the dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Currently selected Pokemon from outside the dialog
   */
  selectedPokemon: PokemonResponseDto | null;
  /**
   * Callback when a Pokemon is selected and confirmed
   */
  onSelect: (pokemon: PokemonResponseDto) => void;
}

export function SelectPokemonDialog({
  open,
  onOpenChange,
  selectedPokemon,
  onSelect,
}: SelectPokemonDialogProps) {
  const { t } = useTranslation();

  // Local state for temporary selection (not committed until "Select" is clicked)
  const [tempSelectedPokemon, setTempSelectedPokemon] = useState<PokemonResponseDto | null>(null);

  // Handle browser back button
  useBackButtonDialog(open, () => onOpenChange(false));

  // Sync temporary selection with external selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelectedPokemon(selectedPokemon);
    }
  }, [open, selectedPokemon]);

  const handleSelect = () => {
    if (tempSelectedPokemon) {
      onSelect(tempSelectedPokemon);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTempSelectedPokemon(selectedPokemon); // Reset to original selection
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:h-full max-sm:max-h-full max-sm:rounded-none sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{t("pokemonPicker.selectDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("pokemonPicker.selectDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Gallery with scroll */}
        <div className="flex-1 overflow-y-auto -mx-6 px-3" style={{ minHeight: '60vh' }}>
          <SelectablePokemonGallery
            onSelect={setTempSelectedPokemon}
            selectedPokemon={tempSelectedPokemon}
            showSearch={true}
            height="50vh"
            maxColumns={4}
            className="border rounded-lg py-4 px-md-4"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {t("pokemonPicker.selectDialog.cancel")}
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!tempSelectedPokemon}
          >
            {t("pokemonPicker.selectDialog.selectButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
