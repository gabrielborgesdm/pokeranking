"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ErrorMessage } from "@/components/error-message";

interface RankingsErrorProps {
  onRetry?: () => void;
}

export const RankingsError = memo(function RankingsError({
  onRetry,
}: RankingsErrorProps) {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8">
      <ErrorMessage
        title={t("userRankings.errorTitle")}
        description={t("userRankings.errorDescription")}
        onRetry={onRetry}
      />
    </main>
  );
});
