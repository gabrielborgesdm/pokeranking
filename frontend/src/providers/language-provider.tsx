"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { setLanguage as setApiLanguage } from "@pokeranking/api-client";

interface Language {
  code: string;
  label: string;
}

interface LanguageContextValue {
  language: string;
  setLanguage: (lang: string) => void;
  languages: Language[];
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português" },
];

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || "en");

  // Sync API client language on mount
  useEffect(() => {
    setApiLanguage(i18n.language || "en");
  }, [i18n.language]);

  const setLanguage = useCallback(
    (lang: string) => {
      // Update i18n (frontend translations + localStorage)
      i18n.changeLanguage(lang);
      // Update API client (Accept-Language header)
      setApiLanguage(lang);
      // Update local state
      setLanguageState(lang);
    },
    [i18n]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
