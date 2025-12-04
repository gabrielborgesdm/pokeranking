"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-32 h-32">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
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
    </div>
  );
}
