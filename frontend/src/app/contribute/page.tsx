"use client";

import { PageHeader } from "@/components/page-header";
import { PixContribution } from "@/components/pix-contribution";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnalytics } from "@/hooks/use-analytics";
import { getClientConfig } from "@/lib/config";
import { routes } from "@/lib/routes";
import { Star } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

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
        <div className="flex items-center gap-3">
          <PageHeader
            title={t("contribute.title")}
            description={t("contribute.description")}
            backHref={routes.home}
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
