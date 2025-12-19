"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { I18nProvider } from "./i18n-provider";
import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";
import { InitialLoad } from "@/components/initial-load";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryProvider>
          <InitialLoad />
          <I18nProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </I18nProvider>
        </QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
