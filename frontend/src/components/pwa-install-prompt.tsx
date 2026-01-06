"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check localStorage to avoid pestering users
    const promptDismissed = localStorage.getItem("pwa-prompt-dismissed");

    // Only show if not dismissed in last 30 days
    if (promptDismissed) {
      const dismissedDate = new Date(promptDismissed);
      const daysSinceDismissal =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 30) return;
    }

    // Android: Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt with a delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS: Show manual instructions
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("pwa-install-attempted", new Date().toISOString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if dismissed
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 shadow-lg border border-border bg-card rounded-lg">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t("pwa.dismiss")}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <img
          src="/favicon/web-app-manifest-192x192.png"
          alt="Pokeranking"
          className="w-12 h-12 rounded-lg flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1 text-foreground">
            {t("pwa.title")}
          </h3>

          {isIOS ? (
            <div className="text-xs text-muted-foreground space-y-2">
              <p>{t("pwa.ios.instruction")}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t("pwa.ios.step1")}</li>
                <li>{t("pwa.ios.step2")}</li>
                <li>{t("pwa.ios.step3")}</li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                {t("pwa.description")}
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t("pwa.installButton")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
