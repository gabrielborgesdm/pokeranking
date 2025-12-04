"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useUploadControllerUploadImage,
  isApiError,
} from "@pokeranking/api-client";

const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  /** Callback when image is clicked (besides fullscreen) */
  onImageClick?: (url: string) => void;
}

export function ImageUpload({ value, onChange, disabled, onImageClick }: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const uploadMutation = useUploadControllerUploadImage();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      uploadMutation.mutate(
        { data: { file } },
        {
          onSuccess: (response) => {
            if (response.status === 201) {
              onChange(response.data.url);
            }
          },
          onError: (err) => {
            setError(
              isApiError(err) ? err.message : t("admin.pokemon.uploadError")
            );
            setPreview(value || null);
          },
        }
      );
    },
    [uploadMutation, onChange, value, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: disabled || uploadMutation.isPending,
  });

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
  };

  const handleImageClick = () => {
    if (preview) {
      onImageClick?.(preview);
      setIsFullscreen(true);
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative inline-block group">
          <div
            className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-border shadow-lg bg-gradient-to-br from-muted/50 to-muted cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {uploadMutation.isPending && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!uploadMutation.isPending && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            )}
          </div>
          {!disabled && !uploadMutation.isPending && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            (disabled || uploadMutation.isPending) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploadMutation.isPending ? (
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploadMutation.isPending
                ? t("admin.pokemon.uploading")
                : t("admin.pokemon.dragDrop")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("admin.pokemon.allowedTypes")}
            </p>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <FullscreenImageDialog
        src={preview}
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
      />
    </div>
  );
}

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
