"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";
import { routes } from "@/lib/routes";
import { BookOpen, Trophy, User2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function Pokeball({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" fill="currentColor" stroke="currentColor" strokeWidth="4" opacity="0.1" />
      <path
        d="M 50 2 A 48 48 0 0 1 98 50 L 65 50 A 15 15 0 0 0 35 50 L 2 50 A 48 48 0 0 1 50 2 Z"
        className="fill-pokemon-red"
      />
      <path
        d="M 2 50 A 48 48 0 0 0 50 98 A 48 48 0 0 0 98 50 L 65 50 A 15 15 0 0 1 35 50 Z"
        className="fill-muted"
      />
      <rect x="2" y="47" width="96" height="6" className="fill-foreground/60" />
      <circle cx="50" cy="50" r="15" className="fill-muted" stroke="currentColor" strokeWidth="4" opacity="0.3" />
      <circle cx="50" cy="50" r="8" className="fill-foreground/10" />
    </svg>
  );
}

export function Onboarding() {
  const { t } = useTranslation();
  const { user, isLoading } = useCurrentUser();
  const username = user?.username;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 animate-pulse min-h-[180px]">
        <div className="flex flex-col items-center text-center gap-3 h-full justify-center">
          {/* Title */}
          <div className="h-7 w-48 rounded bg-muted" />

          {/* Description */}
          <div className="h-4 w-64 rounded bg-muted" />

          {/* Hint */}
          <div className="h-4 w-56 rounded bg-muted" />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 w-36 rounded bg-muted" />
            <div className="h-10 w-36 rounded bg-muted" />
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
      className="relative overflow-hidden rounded-2xl border border-border bg-card min-h-[180px] justify-center flex items-center"
    >
      {/* Decorative pokeballs */}
      <Pokeball className="absolute -top-6 -left-6 w-20 h-20 opacity-20 text-muted-foreground rotate-[-15deg]" />
      <Pokeball className="absolute -bottom-6 -right-6 w-24 h-24 opacity-20 text-muted-foreground rotate-[20deg]" />

      <div className="relative z-10 flex flex-col items-center text-center gap-3 px-6 py-4">
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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {username ? (
            <>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.userRankings(username)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  {t("onboarding.cta")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.pokedex}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("onboarding.goToPokedex")}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" variant="outline">
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
