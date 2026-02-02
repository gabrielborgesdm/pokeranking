"use client";

import { useTranslation } from "react-i18next";
import { RankingForm } from "@/features/rankings";
import { PageHeader } from "@/components/page-header";

export default function NewRankingPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <PageHeader
          title={t("rankingForm.createTitle")}
          description={t("rankingForm.createDescription")}
          backHref="/rankings"
          backLabel={t("common.back")}
        />

        <RankingForm mode="create" />
      </div>
    </main>
  );
}
