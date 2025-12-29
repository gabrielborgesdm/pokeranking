"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { I18nProvider } from "./i18n-provider";
import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";
import { ScreenSizeProvider } from "./screen-size-provider";
import { InitialLoad } from "@/components/initial-load";
import { GithubReminderToast } from "@/components/github-reminder-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScreenSizeProvider>
          <QueryProvider>
            <InitialLoad />
            <I18nProvider>
              <LanguageProvider>
                {children}
                <GithubReminderToast />
              </LanguageProvider>
            </I18nProvider>
          </QueryProvider>
        </ScreenSizeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
