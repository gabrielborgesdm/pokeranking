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
  // Auth events
  | { name: "sign_in_success"; params: { method: string } }
  | { name: "sign_in_error"; params: { error: string } }
  | { name: "sign_up_success"; params: Record<string, never> }
  | { name: "sign_up_error"; params: { error: string } }
  | { name: "forgot_password_submit"; params: Record<string, never> }
  | { name: "reset_password_submit"; params: Record<string, never> }
  // Ranking events
  | { name: "ranking_view"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_create"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_edit"; params: { ranking_id: string; ranking_name: string } }
  | { name: "ranking_share"; params: { ranking_id: string; method: string } }
  | { name: "ranking_delete"; params: { ranking_id: string } }
  | { name: "ranking_like"; params: { ranking_id: string } }
  | { name: "ranking_unlike"; params: { ranking_id: string } }
  | { name: "ranking_update"; params: { ranking_id: string } }
  | { name: "ranking_export"; params: { ranking_id: string; format: "csv" | "json" } }
  // Pokemon events
  | { name: "pokemon_search"; params: { search_term: string } }
  | { name: "tier_change"; params: { ranking_id: string; pokemon_id: string; tier: string } }
  | { name: "pokemon_details_view"; params: { pokemon_id: string; pokemon_name: string } }
  | { name: "pokemon_filter_change"; params: { filter_type: string; value: string } }
  | { name: "pokedex_filter_change"; params: { types?: string; generation?: string; sort_by?: string } }
  // Page view events
  | { name: "page_view"; params: { page: string; page_title?: string } }
  | { name: "pagination_change"; params: { page: string; page_number: number } }
  | { name: "sort_change"; params: { page: string; sort_by: string; order: string } }
  // Donation events
  | { name: "donation_start"; params: { method: "github" } }
  | { name: "donation_complete"; params: { method: "github" } }
  // Support events
  | { name: "support_submit_success"; params: Record<string, never> }
  | { name: "support_submit_error"; params: { error: string } }
  // UI events
  | { name: "theme_toggle"; params: { theme: string } }
  | { name: "navbar_menu_open"; params: Record<string, never> }
  | { name: "search_overlay_open"; params: { ranking_id: string } }
  | { name: "user_profile_click"; params: { user_id: string; username: string } }
  | { name: "leaderboard_user_click"; params: { user_id: string; username: string } }
  // Error events
  | { name: "api_error"; params: { endpoint: string; error: string; status?: number } }
  // GitHub reminder events
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
