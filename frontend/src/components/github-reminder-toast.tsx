"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Star, Heart, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGithubReminder } from "@/hooks/use-github-reminder";
import { useAnalytics } from "@/hooks/use-analytics";
import { routes } from "@/lib/routes";

const TOAST_DELAY_MS = 3000;
const TOAST_DURATION_MS = 15000;

export function GithubReminderToast() {
  const { t } = useTranslation();
  const { shouldShowReminder, githubUrl, onDismiss, onAction } =
    useGithubReminder();
  const {
    trackGithubReminderShown,
    trackGithubReminderStarClick,
    trackGithubReminderContributeClick,
    trackGithubReminderDismissed,
  } = useAnalytics();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!shouldShowReminder || hasShownRef.current) return;

    const timeoutId = setTimeout(() => {
      hasShownRef.current = true;
      trackGithubReminderShown();

      toast.custom(
        (toastId) => (
          <div className="flex items-start gap-3 rounded-lg border bg-popover p-4 shadow-lg w-full max-w-md">
            <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <div className="font-semibold text-popover-foreground">
                  {t("githubReminder.title")}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("githubReminder.description")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackGithubReminderStarClick();
                      onAction();
                      toast.dismiss(toastId);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    {t("githubReminder.starButton")}
                  </a>
                )}
                <a
                  href={routes.contribute}
                  onClick={() => {
                    trackGithubReminderContributeClick();
                    onAction();
                    toast.dismiss(toastId);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  {t("githubReminder.contributeButton")}
                </a>
              </div>
            </div>
            <button
              onClick={() => {
                trackGithubReminderDismissed();
                onDismiss();
                toast.dismiss(toastId);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ),
        {
          duration: TOAST_DURATION_MS,
          onDismiss: () => {
            trackGithubReminderDismissed();
            onDismiss();
          },
        }
      );
    }, TOAST_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [
    shouldShowReminder,
    githubUrl,
    onDismiss,
    onAction,
    t,
    trackGithubReminderShown,
    trackGithubReminderStarClick,
    trackGithubReminderContributeClick,
    trackGithubReminderDismissed,
  ]);

  return null;
}
