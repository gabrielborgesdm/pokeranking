"use client";

import { useCallback } from "react";
import { trackEvent, type AnalyticsEvent } from "@/components/google-analytics";

export function useAnalytics() {
  const track = useCallback(<T extends AnalyticsEvent>(event: T) => {
    trackEvent(event);
  }, []);

  return {
    track,
    trackRankingView: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_view", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingCreate: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_create", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingEdit: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_edit", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingShare: (rankingId: string, method: string) =>
      track({ name: "ranking_share", params: { ranking_id: rankingId, method } }),
    trackPokemonSearch: (searchTerm: string) =>
      track({ name: "pokemon_search", params: { search_term: searchTerm } }),
    trackTierChange: (rankingId: string, pokemonId: string, tier: string) =>
      track({ name: "tier_change", params: { ranking_id: rankingId, pokemon_id: pokemonId, tier } }),
    trackDonationStart: (method: "stripe" | "github") =>
      track({ name: "donation_start", params: { method } }),
    trackDonationComplete: (method: "stripe" | "github") =>
      track({ name: "donation_complete", params: { method } }),
    trackGithubReminderShown: () =>
      track({ name: "github_reminder_shown", params: {} }),
    trackGithubReminderStarClick: () =>
      track({ name: "github_reminder_star_click", params: {} }),
    trackGithubReminderContributeClick: () =>
      track({ name: "github_reminder_contribute_click", params: {} }),
    trackGithubReminderDismissed: () =>
      track({ name: "github_reminder_dismissed", params: {} }),
  };
}
