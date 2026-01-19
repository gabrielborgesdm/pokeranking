"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FullscreenImageDialog } from "@/components/fullscreen-image-dialog";
import {
  useUploadControllerUploadImage,
  isApiError,
} from "@pokeranking/api-client";
import { normalizePokemonImageSrc } from "@/lib/image-utils";
import { translateApiError } from "@/lib/translate-api-error";

const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  /** Callback when image is clicked (besides fullscreen) */
  onImageClick?: (url: string) => void;
}

export function ImageUpload({ value, onChange, disabled, onImageClick }: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(value ? normalizePokemonImageSrc(value) || null : null);
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
              isApiError(err) ? translateApiError(err, t) : t("admin.pokemon.uploadError")
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
