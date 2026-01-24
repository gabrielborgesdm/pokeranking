"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useRankingsControllerFindByUsername } from "@pokeranking/api-client";

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
  const { data: session, status } = useSession();
  const isSessionLoading = status === "loading";
  const username = session?.user?.username;

  const { data: rankingsData, isLoading } = useRankingsControllerFindByUsername(
    username ?? "",
    { query: { enabled: !!username } }
  );

  const hasRankings = (rankingsData?.data?.length ?? 0) > 0;
  const shouldShow = !isSessionLoading && !(username && (isLoading || hasRankings));

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Decorative pokeballs */}
          <Pokeball className="absolute -top-6 -left-6 w-24 h-24 opacity-20 text-muted-foreground rotate-[-15deg]" />
          <Pokeball className="absolute -bottom-8 -right-8 w-32 h-32 opacity-20 text-muted-foreground rotate-[20deg]" />
          <Pokeball className="absolute top-1/2 -translate-y-1/2 -right-4 w-16 h-16 opacity-10 text-muted-foreground rotate-[45deg] hidden md:block" />

          <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 py-6 ">
            {/* Header with pokeballs */}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("onboarding.welcome")}
              </h2>
            </div>

            {/* Description */}
            <p className="text-muted-foreground max-w-lg text-sm md:text-base leading-relaxed">
              {t("onboarding.description")}
            </p>

            {/* Hint */}
            <p className="text-sm md:text-base font-medium text-foreground/70">
              {username ? t("onboarding.loggedHint") : t("onboarding.guestHint")}
            </p>

            {/* CTA Button */}
            {username ? (
              <Button asChild size="lg" className="mt-4" variant="outline">
                <Link href={username ? routes.userRankings(username) : routes.signin}>
                  {t("onboarding.cta")}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-2" variant="outline">
                <Link href={routes.signup}>
                  <User2 className="mr-2 h-4 w-4" />
                  {t("onboarding.createAccount")}
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
