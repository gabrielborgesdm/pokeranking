"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "./use-local-storage";
import { getClientConfig } from "@/lib/config";

const STORAGE_KEY = "pokeranking:github-reminder";
const REMINDER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MIN_VISIT_COUNT = 2;
const VISIT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours between visit counts

interface ReminderState {
  visitCount: number;
  permanentlyDismissed: boolean;
  lastDismissedAt: number | null;
  lastVisitAt: number | null;
}

const DEFAULT_STATE: ReminderState = {
  visitCount: 0,
  permanentlyDismissed: false,
  lastDismissedAt: null,
  lastVisitAt: null,
};

interface UseGithubReminderReturn {
  shouldShowReminder: boolean;
  githubUrl: string | undefined;
  onDismiss: () => void;
  onAction: () => void;
}

export function useGithubReminder(): UseGithubReminderReturn {
  const config = getClientConfig();
  const hasIncrementedVisit = useRef(false);

  const {
    value: state,
    setValue: setState,
    isLoaded,
  } = useLocalStorage<ReminderState>({
    key: STORAGE_KEY,
    initialValue: DEFAULT_STATE,
  });

  useEffect(() => {
    if (!isLoaded || hasIncrementedVisit.current) return;

    const now = Date.now();
    const lastVisit = state.lastVisitAt;

    // Only count as a new visit if 24 hours have passed since last visit
    if (!lastVisit || now - lastVisit >= VISIT_COOLDOWN_MS) {
      hasIncrementedVisit.current = true;
      setState((prev) => ({
        ...prev,
        visitCount: prev.visitCount + 1,
        lastVisitAt: now,
      }));
    } else {
      hasIncrementedVisit.current = true; // Prevent re-checking during this session
    }
  }, [isLoaded, setState, state.lastVisitAt]);

  const calculateShouldShow = useCallback((): boolean => {
    if (!isLoaded) return false;
    if (!config.githubUrl) return false;
    if (state.permanentlyDismissed) return false;
    if (state.visitCount < MIN_VISIT_COUNT) return false;

    if (state.lastDismissedAt) {
      const timeSinceDismissal = Date.now() - state.lastDismissedAt;
      if (timeSinceDismissal < REMINDER_COOLDOWN_MS) return false;
    }

    return true;
  }, [isLoaded, config.githubUrl, state]);

  const onDismiss = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastDismissedAt: Date.now(),
    }));
  }, [setState]);

  const onAction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      permanentlyDismissed: true,
    }));
  }, [setState]);

  return {
    shouldShowReminder: calculateShouldShow(),
    githubUrl: config.githubUrl,
    onDismiss,
    onAction,
  };
}
