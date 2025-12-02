"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Menu, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useThemeContext } from "@/providers/theme-provider";

export function Navbar() {
  const { t } = useTranslation();
  const { isDark, ThemeIcon, toggleTheme } = useThemeContext();
  // TODO: Replace with actual auth state
  const isAuthenticated = false;

  const navLinks = [
    { href: "/", label: t("nav.leaderboard") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Pokeranking</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">{t("nav.userMenu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={toggleTheme}>
                  <ThemeIcon className="mr-2 h-4 w-4" />
                  {isDark ? t("nav.lightMode") : t("nav.darkMode")}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <ThemeIcon className="h-5 w-5" />
                <span className="sr-only">{t("nav.toggleTheme")}</span>
              </Button>
              <Button asChild>
                <Link href="/signin">{t("nav.signIn")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mr-2"
          >
            <ThemeIcon className="h-5 w-5" />
            <span className="sr-only">{t("nav.toggleTheme")}</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 h-px bg-border" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <Settings className="h-5 w-5" />
                      {t("nav.settings")}
                    </Link>
                    <button className="flex items-center gap-2 text-lg font-medium text-destructive transition-colors hover:text-destructive/80">
                      <LogOut className="h-5 w-5" />
                      {t("nav.signOut")}
                    </button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/signin">{t("nav.signIn")}</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
