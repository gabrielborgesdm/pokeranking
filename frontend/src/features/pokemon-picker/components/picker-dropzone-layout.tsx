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
        "grid grid-cols-1 md:grid-cols-2 gap-4",
        "h-[calc(100vh-12rem)] md:h-auto",
        className
      )}
    >
      {/* Dropzone - left on desktop, top on mobile */}
      <div className="h-[50%] md:h-auto overflow-hidden">{dropzone}</div>

      {/* Picker - right on desktop, bottom on mobile */}
      <div className="h-[50%] md:h-auto overflow-hidden">{picker}</div>
    </div>
  );
}
