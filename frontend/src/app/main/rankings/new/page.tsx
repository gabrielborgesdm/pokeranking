"use client";

import { useTranslation } from "react-i18next";
import { RankingForm } from "@/features/rankings";
import { PageHeader } from "@/components/page-header";
import { routes } from "@/lib/routes";

export default function NewRankingPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <PageHeader
          title={t("rankingForm.createTitle")}
          description={t("rankingForm.createDescription")}
          backLabel={t("common.back")}
        />

        <RankingForm mode="create" />
      </div>
    </main>
  );
}
