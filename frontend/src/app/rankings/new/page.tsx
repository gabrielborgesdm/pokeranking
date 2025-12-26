"use client";

import { useTranslation } from "react-i18next";
import { RankingForm } from "@/features/rankings";

export default function NewRankingPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("rankingForm.createTitle")}</h1>
          <p className="text-muted-foreground">
            {t("rankingForm.createDescription")}
          </p>
        </div>

        <RankingForm mode="create" />
      </div>
    </main>
  );
}
