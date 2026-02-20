"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";
import { routes } from "@/lib/routes";
import { BookOpen, Trophy, User2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Onboarding() {
  const { t } = useTranslation();
  const { user, isLoading } = useCurrentUser();
  const username = user?.username;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse min-h-[180px]">
        <div className="flex flex-col items-center text-center gap-3 h-full justify-center">
          {/* Title */}
          <div className="h-7 w-48 rounded bg-muted" />

          {/* Description */}
          <div className="h-4 w-64 rounded bg-muted" />

          {/* Hint */}
          <div className="h-4 w-56 rounded bg-muted" />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-9 w-32 rounded bg-muted" />
            <div className="h-9 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl border border-border bg-card min-h-[180px] justify-center flex items-center"
    >
      <div className="flex flex-col items-center text-center gap-3 px-6 py-4">
        {/* Header */}
        <h2 className="text-xl md:text-2xl font-bold">
          {t("onboarding.welcome")}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-sm md:text-base">
          {t("onboarding.description")}
        </p>

        {/* Hint */}
        <p className="text-sm font-medium text-foreground/70">
          {username ? t("onboarding.loggedHint") : t("onboarding.guestHint")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {username ? (
            <>
              <Button asChild variant="outline" className="w-full sm:w-40">
                <Link href={routes.userRankings(username)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  {t("onboarding.cta")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-40">
                <Link href={routes.pokedex}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("onboarding.goToPokedex")}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href={routes.signup}>
                <User2 className="mr-2 h-4 w-4" />
                {t("onboarding.createAccount")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
