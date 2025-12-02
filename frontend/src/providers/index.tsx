"use client";

import { QueryProvider } from "./query-provider";
import { I18nProvider } from "./i18n-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <I18nProvider>{children}</I18nProvider>
    </QueryProvider>
  );
}
