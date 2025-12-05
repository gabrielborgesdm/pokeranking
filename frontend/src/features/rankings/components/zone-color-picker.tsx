"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Pokemon-themed color palette
export const ZONE_COLORS = [
  { id: "red", hex: "#ef4444", name: "Red" },
  { id: "orange", hex: "#f97316", name: "Orange" },
  { id: "amber", hex: "#f59e0b", name: "Amber" },
  { id: "yellow", hex: "#eab308", name: "Yellow" },
  { id: "lime", hex: "#84cc16", name: "Lime" },
  { id: "green", hex: "#22c55e", name: "Green" },
  { id: "teal", hex: "#14b8a6", name: "Teal" },
  { id: "cyan", hex: "#06b6d4", name: "Cyan" },
  { id: "blue", hex: "#3b82f6", name: "Blue" },
  { id: "indigo", hex: "#6366f1", name: "Indigo" },
  { id: "purple", hex: "#a855f7", name: "Purple" },
  { id: "pink", hex: "#ec4899", name: "Pink" },
  { id: "rose", hex: "#f43f5e", name: "Rose" },
  { id: "gray", hex: "#6b7280", name: "Gray" },
  { id: "slate", hex: "#64748b", name: "Slate" },
  { id: "brown", hex: "#a16207", name: "Brown" },
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
