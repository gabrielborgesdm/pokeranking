"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Pokemon silhouette image */}
        <div className="relative mx-auto w-48 h-48 animate-pulse">
          <Image
            src="/images/who.png"
            alt="Who's that Pokemon?"
            fill
            className="object-contain opacity-80 dark:invert dark:opacity-70"
            priority
          />
        </div>

        {/* 404 text with Pokemon styling */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-gradient-pokemon tracking-tight">
            404
          </h1>
          <p className="text-2xl font-semibold text-foreground">
            {t("notFound.title", "Page not found!")}
          </p>
          <p className="text-muted-foreground">
            {t(
              "notFound.description",
              "Looks like this page fled the battle. It might be hiding in tall grass somewhere..."
            )}
          </p>
        </div>

        {/* Decorative Pokeball divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-pokemon-red" />
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-foreground/80 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-background" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-foreground/80" />
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={routes.home}>
              <Home className="size-4" />
              {t("notFound.goHome", "Go to Homepage")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={routes.myRankings}>
              <Search className="size-4" />
              {t("notFound.viewRankings", "View Rankings")}
            </Link>
          </Button>
        </div>

        {/* Fun Pokemon-themed hint */}
        <p className="text-sm text-muted-foreground/60 italic">
          {t("notFound.hint", 'Hint: Try using "Fly" to navigate to a known location!')}
        </p>
      </div>
    </main>
  );
}
