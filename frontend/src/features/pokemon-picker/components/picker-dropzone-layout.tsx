"use client";

import { cn } from "@/lib/utils";

interface PickerDropzoneLayoutProps {
  dropzone: React.ReactNode;
  picker: React.ReactNode;
  className?: string;
}

/**
 * Responsive layout for PokemonDropzone and PokemonPicker.
 * - Desktop (md+): Two-column grid with dropzone left, picker right
 * - Mobile: Full-width stacked sections
 */
export function PickerDropzoneLayout({
  dropzone,
  picker,
  className,
}: PickerDropzoneLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        // Mobile: single column, auto rows that fit content
        "grid-cols-1 auto-rows-min",
        // Desktop: two equal columns, single row
        "md:grid-cols-2 md:grid-rows-1",
        className
      )}
    >
      {/* Dropzone - left on desktop, top on mobile */}
      <div className="min-h-0 overflow-hidden max-h-[40vh] md:max-h-none">{dropzone}</div>

      {/* Picker - right on desktop, bottom on mobile */}
      <div className="min-h-0 overflow-hidden max-h-[40vh] md:max-h-none">{picker}</div>
    </div>
  );
}
