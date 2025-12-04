"use client";

import { useTranslation } from "react-i18next";
import { Heart, Star, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StripeCheckout } from "@/components/stripe-checkout";
import { getClientConfig } from "@/lib/config";

export default function ContributePage() {
  const { t } = useTranslation();
  const config = getClientConfig();

  const hasStripe = config.stripePublishableKey && config.stripePriceId;

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
                >
                  <Star className="h-4 w-4" />
                  {t("contribute.github.button")}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stripe Section */}
        {hasStripe && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <CardTitle>{t("contribute.stripe.title")}</CardTitle>
              </div>
              <CardDescription>
                {t("contribute.stripe.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripeCheckout />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
