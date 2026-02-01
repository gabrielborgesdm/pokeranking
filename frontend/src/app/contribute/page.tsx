"use client";

import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixContribution } from "@/components/pix-contribution";
import { getClientConfig } from "@/lib/config";
import { useAnalytics } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";

export default function ContributePage() {
  const { t } = useTranslation();
  const config = getClientConfig();
  const { trackPageView, trackDonationStart } = useAnalytics();

  useEffect(() => {
    trackPageView("contribute", "Contribute");
  }, [trackPageView]);

  const handleGithubClick = useCallback(() => {
    trackDonationStart("github");
  }, [trackDonationStart]);

  const hasPix = !!config.pixCode;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-8">
        {/* Header */}
        <BackButton />
        <div className="flex items-center gap-3">
          <PageHeader
            title={t("contribute.title")}
            description={t("contribute.description")}
          />

        </div>

        {/* GitHub Star Section */}
        {config.githubUrl && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <CardTitle>{t("contribute.github.title")}</CardTitle>
              </div>
              <CardDescription>
                {t("contribute.github.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a
                  href={config.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                  onClick={handleGithubClick}
                >
                  <Star className="h-4 w-4" />
                  {t("contribute.github.button")}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pix Section */}
        {hasPix && <PixContribution pixCode={config.pixCode!} />}
      </div>
    </main>
  );
}
