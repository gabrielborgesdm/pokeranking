"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, BookOpen } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PokedexInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.matchMedia("(max-width: 768px)").matches;
    setIsMobile(mobile);

    if (!mobile) return;

    const promptDismissed = localStorage.getItem("pokedex-pwa-prompt-dismissed");
    if (promptDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem("pokedex-pwa-prompt-dismissed")) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        if (!localStorage.getItem("pokedex-pwa-prompt-dismissed")) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (ios && !standalone) {
      setTimeout(() => {
        if (!localStorage.getItem("pokedex-pwa-prompt-dismissed")) {
          setShowPrompt(true);
        }
      }, 2000);
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
      localStorage.setItem(
        "pokedex-pwa-install-attempted",
        new Date().toISOString()
      );
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(
      "pokedex-pwa-prompt-dismissed",
      new Date().toISOString()
    );
  };

  if (!isMobile) return null;
  if (isIOS) return null;
  if (isStandalone) return null;
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("pokedex-pwa-prompt-dismissed")
  )
    return null;
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 shadow-lg border border-red-500/30 bg-card rounded-lg">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t("pwa.dismiss")}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-red-500 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1 text-foreground">
            {t("pokedexPwa.title")}
          </h3>

          {isIOS ? (
            <div className="text-xs text-muted-foreground space-y-2">
              <ul className="space-y-1 mb-2">
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.separateApp")}
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.offlineAccess")}
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.canInstallBoth")}
                </li>
              </ul>
              <p>{t("pwa.ios.instruction")}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t("pwa.ios.step1")}</li>
                <li>{t("pwa.ios.step2")}</li>
                <li>{t("pwa.ios.step3")}</li>
              </ol>
            </div>
          ) : (
            <>
              <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.separateApp")}
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.offlineAccess")}
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {t("pokedexPwa.canInstallBoth")}
                </li>
              </ul>
              <button
                onClick={handleInstallClick}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
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
