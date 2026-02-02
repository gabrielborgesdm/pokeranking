"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeContext } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { routes } from "@/lib/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { ThemeIcon, toggleTheme } = useThemeContext();
  const { language, setLanguage, languages } = useLanguage();
  const pathname = usePathname();

  // an anti-pattern to detect if we are on the signup page, but acceptable for this simple use case
  const isSignUpPage = pathname === routes.signup;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 auth-bg">
      {!isSignUpPage && (
        <div className="fixed right-4 top-4 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t("nav.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                  {language === lang.code && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <ThemeIcon className="h-5 w-5" />
            <span className="sr-only">{t("nav.toggleTheme")}</span>
          </Button>
        </div>
      )}
      <div className="mb-8">
        <Logo size="large" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
