"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Refined color palette with softer, more elegant tones
export const ZONE_COLORS = [
  { id: "coral", hex: "#e07065", name: "Coral" },
  { id: "peach", hex: "#e8956a", name: "Peach" },
  { id: "amber", hex: "#d4a054", name: "Amber" },
  { id: "gold", hex: "#c9b458", name: "Gold" },
  { id: "sage", hex: "#7cb078", name: "Sage" },
  { id: "mint", hex: "#5db8a3", name: "Mint" },
  { id: "teal", hex: "#4aa8b8", name: "Teal" },
  { id: "sky", hex: "#5a9fd4", name: "Sky" },
  { id: "azure", hex: "#6889d4", name: "Azure" },
  { id: "periwinkle", hex: "#8080d0", name: "Periwinkle" },
  { id: "lavender", hex: "#a078c0", name: "Lavender" },
  { id: "orchid", hex: "#c86ca8", name: "Orchid" },
  { id: "rose", hex: "#d4707a", name: "Rose" },
  { id: "slate", hex: "#7a8899", name: "Slate" },
  { id: "graphite", hex: "#6a7380", name: "Graphite" },
  { id: "bronze", hex: "#a08060", name: "Bronze" },
] as const;

export type ZoneColorId = (typeof ZONE_COLORS)[number]["id"];

interface ZoneColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ZoneColorPicker = memo(function ZoneColorPicker({
  value,
  onChange,
  className,
}: ZoneColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {ZONE_COLORS.map((color) => {
        const isSelected = value === color.hex;
        return (
          <Tooltip key={color.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onChange(color.hex)}
                className={cn(
                  "w-6 h-6 rounded-md transition-all border border-transparent",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  "hover:scale-110"
                )}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {color.name}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
});
