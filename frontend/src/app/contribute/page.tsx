"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Star, CreditCard, ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StripeCheckout } from "@/components/stripe-checkout";
import { PixContribution } from "@/components/pix-contribution";
import { getClientConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";

export default function ContributePage() {
  const { t } = useTranslation();
  const config = getClientConfig();
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const { trackPageView, trackDonationStart } = useAnalytics();

  useEffect(() => {
    trackPageView("contribute", "Contribute");
  }, [trackPageView]);

  const handleGithubClick = useCallback(() => {
    trackDonationStart("github");
  }, [trackDonationStart]);

  const handleStripeOpen = useCallback((open: boolean) => {
    setIsStripeOpen(open);
    if (open) {
      trackDonationStart("stripe");
    }
  }, [trackDonationStart]);

  const hasStripe = config.stripePublishableKey && config.stripePriceId;
  const hasPix = !!config.pixCode;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("contribute.title")}</h1>
            <p className="text-muted-foreground">
              {t("contribute.description")}
            </p>
          </div>
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

        {/* Stripe Section (Collapsible) */}
        {hasStripe && (
          <Card className="overflow-hidden">
            <Collapsible open={isStripeOpen} onOpenChange={handleStripeOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <CardTitle>{t("contribute.stripe.title")}</CardTitle>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        isStripeOpen && "rotate-180"
                      )}
                    />
                  </div>
                  <CardDescription>
                    {t("contribute.stripe.description")}
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <StripeCheckout />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </main>
  );
}
