"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface FullscreenImageDialogProps {
  src: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
}

export function FullscreenImageDialog({
  src,
  open,
  onOpenChange,
  alt = "Fullscreen image",
}: FullscreenImageDialogProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-background border-2 border-border rounded-2xl shadow-2xl"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        {/* Custom close button - more visible */}
        <DialogClose asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-muted hover:bg-muted-foreground/20 border border-border"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>

        {/* Pokeball decorative elements - subtle version */}
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-muted border border-border opacity-50">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/20 border border-border" />
        </div>
        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-muted border border-border opacity-50">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/20 border border-border" />
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-muted-foreground/40 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        <div className="absolute top-0 right-0 w-20 h-px bg-gradient-to-l from-muted-foreground/40 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-20 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-20 h-px bg-gradient-to-r from-muted-foreground/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-20 bg-gradient-to-t from-muted-foreground/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-20 h-px bg-gradient-to-l from-muted-foreground/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-20 bg-gradient-to-t from-muted-foreground/40 to-transparent" />

        <div className="relative w-full h-full flex items-center justify-center p-6">
          <div className="relative">
            {/* Image glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/30 to-muted-foreground/20 rounded-xl blur-sm" />
            <img
              src={src}
              alt={alt}
              className="relative max-w-full max-h-[80vh] object-contain rounded-xl border border-border"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
