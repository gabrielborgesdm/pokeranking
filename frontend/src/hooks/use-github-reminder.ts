"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "./use-local-storage";
import { getClientConfig } from "@/lib/config";

const STORAGE_KEY = "pokeranking:github-reminder";
const REMINDER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MIN_VISIT_COUNT = 2;

interface ReminderState {
  visitCount: number;
  permanentlyDismissed: boolean;
  lastDismissedAt: number | null;
}

const DEFAULT_STATE: ReminderState = {
  visitCount: 0,
  permanentlyDismissed: false,
  lastDismissedAt: null,
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

    hasIncrementedVisit.current = true;
    setState((prev) => ({
      ...prev,
      visitCount: prev.visitCount + 1,
    }));
  }, [isLoaded, setState]);

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
