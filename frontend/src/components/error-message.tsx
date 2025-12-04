"use client";

import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title, description, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-bold text-destructive">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
