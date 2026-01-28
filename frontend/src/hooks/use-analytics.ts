"use client";

import { useCallback } from "react";
import { trackEvent, type AnalyticsEvent } from "@/components/google-analytics";

export function useAnalytics() {
  const track = useCallback(<T extends AnalyticsEvent>(event: T) => {
    trackEvent(event);
  }, []);

  return {
    track,
    // Auth events
    trackSignInSuccess: (method: string) =>
      track({ name: "sign_in_success", params: { method } }),
    trackSignInError: (error: string) =>
      track({ name: "sign_in_error", params: { error } }),
    trackSignUpSuccess: () =>
      track({ name: "sign_up_success", params: {} }),
    trackSignUpError: (error: string) =>
      track({ name: "sign_up_error", params: { error } }),
    trackForgotPasswordSubmit: () =>
      track({ name: "forgot_password_submit", params: {} }),
    trackResetPasswordSubmit: () =>
      track({ name: "reset_password_submit", params: {} }),
    // Ranking events
    trackRankingView: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_view", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingCreate: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_create", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingEdit: (rankingId: string, rankingName: string) =>
      track({ name: "ranking_edit", params: { ranking_id: rankingId, ranking_name: rankingName } }),
    trackRankingShare: (rankingId: string, method: string) =>
      track({ name: "ranking_share", params: { ranking_id: rankingId, method } }),
    trackRankingDelete: (rankingId: string) =>
      track({ name: "ranking_delete", params: { ranking_id: rankingId } }),
    trackRankingLike: (rankingId: string) =>
      track({ name: "ranking_like", params: { ranking_id: rankingId } }),
    trackRankingUnlike: (rankingId: string) =>
      track({ name: "ranking_unlike", params: { ranking_id: rankingId } }),
    trackRankingUpdate: (rankingId: string) =>
      track({ name: "ranking_update", params: { ranking_id: rankingId } }),
    trackRankingExport: (rankingId: string, format: "csv" | "json") =>
      track({ name: "ranking_export", params: { ranking_id: rankingId, format } }),
    // Pokemon events
    trackPokemonSearch: (searchTerm: string) =>
      track({ name: "pokemon_search", params: { search_term: searchTerm } }),
    trackTierChange: (rankingId: string, pokemonId: string, tier: string) =>
      track({ name: "tier_change", params: { ranking_id: rankingId, pokemon_id: pokemonId, tier } }),
    trackPokemonDetailsView: (pokemonId: string, pokemonName: string) =>
      track({ name: "pokemon_details_view", params: { pokemon_id: pokemonId, pokemon_name: pokemonName } }),
    trackPokemonFilterChange: (filterType: string, value: string) =>
      track({ name: "pokemon_filter_change", params: { filter_type: filterType, value } }),
    trackPokedexFilterChange: (filters: { types?: string; generation?: string; sort_by?: string }) =>
      track({ name: "pokedex_filter_change", params: filters }),
    // Page view events
    trackPageView: (page: string, pageTitle?: string) =>
      track({ name: "page_view", params: { page, page_title: pageTitle } }),
    trackPaginationChange: (page: string, pageNumber: number) =>
      track({ name: "pagination_change", params: { page, page_number: pageNumber } }),
    trackSortChange: (page: string, sortBy: string, order: string) =>
      track({ name: "sort_change", params: { page, sort_by: sortBy, order } }),
    // Donation events
    trackDonationStart: (method: "github" | "pix") =>
      track({ name: "donation_start", params: { method } }),
    trackDonationComplete: (method: "github" | "pix") =>
      track({ name: "donation_complete", params: { method } }),
    // Support events
    trackSupportSubmitSuccess: () =>
      track({ name: "support_submit_success", params: {} }),
    trackSupportSubmitError: (error: string) =>
      track({ name: "support_submit_error", params: { error } }),
    // UI events
    trackThemeToggle: (theme: string) =>
      track({ name: "theme_toggle", params: { theme } }),
    trackNavbarMenuOpen: () =>
      track({ name: "navbar_menu_open", params: {} }),
    trackSearchOverlayOpen: (rankingId: string) =>
      track({ name: "search_overlay_open", params: { ranking_id: rankingId } }),
    trackUserProfileClick: (userId: string, username: string) =>
      track({ name: "user_profile_click", params: { user_id: userId, username } }),
    trackLeaderboardUserClick: (userId: string, username: string) =>
      track({ name: "leaderboard_user_click", params: { user_id: userId, username } }),
    // Error events
    trackApiError: (endpoint: string, error: string, status?: number) =>
      track({ name: "api_error", params: { endpoint, error, status } }),
    // GitHub reminder events
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
