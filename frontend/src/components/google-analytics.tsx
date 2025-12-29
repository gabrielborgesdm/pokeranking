"use client";

import Script from "next/script";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date | Record<string, unknown>,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export type AnalyticsEvent =
  | { name: "ranking_view"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_create"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_edit"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_share"; params: { ranking_id: string; method: string } }
  | { name: "pokemon_search"; params: { search_term: string } }
  | { name: "tier_change"; params: { ranking_id: string; pokemon_id: string; tier: string } }
  | { name: "donation_start"; params: { method: "stripe" | "github" } }
  | { name: "donation_complete"; params: { method: "stripe" | "github" } }
  | { name: "github_reminder_shown"; params: Record<string, never> }
  | { name: "github_reminder_star_click"; params: Record<string, never> }
  | { name: "github_reminder_contribute_click"; params: Record<string, never> }
  | { name: "github_reminder_dismissed"; params: Record<string, never> };

export function trackEvent<T extends AnalyticsEvent>(event: T) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("event", event.name, event.params);
}

export function setAnalyticsUserId(userId: string | null) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("set", { user_id: userId });
}

function AnalyticsUserSync() {
  const { data: session, status } = useSession();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id ?? null;

    if (userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      setAnalyticsUserId(userId);
    }
  }, [session, status]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <AnalyticsUserSync />
    </>
  );
}
