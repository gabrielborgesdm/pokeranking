"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { WifiOff, BookOpen } from "lucide-react";
import { useIsOffline } from "@/hooks/use-is-offline";
import { routes } from "@/lib/routes";

export function OfflineBanner() {
  const { t } = useTranslation();
  const isOffline = useIsOffline();

  if (!isOffline) return null;

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
      <div className="flex items-start gap-3">
        <WifiOff className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-sm text-foreground">
            {t("offline.title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("offline.message")}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <BookOpen className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-foreground/80">
              {t("offline.pokedexHint")}
            </p>
          </div>
          <Link
            href={routes.pokedex}
            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {t("offline.goToPokedex")}
          </Link>
        </div>
      </div>
    </div>
  );
}
