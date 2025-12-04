"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, User, Trophy, Heart, Palette, List, MessageSquare, Shield, PawPrint, LucideIcon, ChevronDown, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useThemeContext } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { Logo } from "@/components/logo";
import { RankingsDropdown } from "@/components/rankings-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

function NavbarSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-32 rounded-md" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
}

interface AccountDropdownProps {
  username: string;
  isAdmin: boolean;
  isDark: boolean;
  ThemeIcon: LucideIcon;
  toggleTheme: () => void;
}

function AccountDropdown({ username, isAdmin, isDark, ThemeIcon, toggleTheme }: AccountDropdownProps) {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 rounded-full px-2">
          <User className="h-5 w-5" />
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">{t("nav.userMenu")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">{username}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.design}>
            <Palette className="mr-2 h-4 w-4" />
            {t("nav.design")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.support}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {t("nav.support")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          <ThemeIcon className="mr-2 h-4 w-4" />
          {isDark ? t("nav.lightMode") : t("nav.darkMode")}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 h-4 w-4" />
            {t("nav.language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.label}
                {language === lang.code && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="mr-2 h-4 w-4" />
                {t("nav.admin")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href={routes.adminPokemon}>
                    <PawPrint className="mr-2 h-4 w-4" />
                    {t("nav.adminPokemon")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavLinksProps {
  links: NavLink[];
  pathname: string;
  variant?: "desktop" | "mobile";
}

function NavLinks({ links, pathname, variant = "desktop" }: NavLinksProps) {
  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center font-medium transition-colors",
              variant === "desktop" && "gap-1.5 text-sm hover-scale",
              variant === "mobile" && "gap-2 text-lg",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { isDark, ThemeIcon, toggleTheme } = useThemeContext();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = useIsAdmin();

  // Desktop nav links (without My Rankings - it uses the dropdown)
  const desktopNavLinks: NavLink[] = [
    { href: routes.home, label: t("nav.leaderboard"), icon: Trophy },
    { href: routes.contribute, label: t("nav.contribute"), icon: Heart },
  ];

  // Mobile nav links (includes My Rankings as simple link)
  const mobileNavLinks: NavLink[] = [
    { href: routes.home, label: t("nav.leaderboard"), icon: Trophy },
    ...(isAuthenticated
      ? [{ href: routes.myRankings, label: t("nav.myRankings"), icon: List }]
      : []),
    { href: routes.contribute, label: t("nav.contribute"), icon: Heart },
  ];

  return (
    <header className="top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Logo className="mr-6" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-6">

          <NavLinks links={desktopNavLinks} pathname={pathname} variant="desktop" />
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {isLoading ? (
            <NavbarSkeleton />
          ) : isAuthenticated ? (
            <>
              <RankingsDropdown />
              <AccountDropdown
                username={session?.user?.username ?? ""}
                isAdmin={isAdmin}
                isDark={isDark}
                ThemeIcon={ThemeIcon}
                toggleTheme={toggleTheme}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <ThemeIcon className="h-5 w-5" />
                <span className="sr-only">{t("nav.toggleTheme")}</span>
              </Button>
              <Button variant="outline" asChild>
                <Link href={routes.signin}>
                  <User className="mr-2 h-5 w-5" />
                  {t("nav.signIn")}
                </Link>
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
              <nav className="mt-6 mx-4 flex flex-col gap-4">
                <NavLinks links={mobileNavLinks} pathname={pathname} variant="mobile" />
                <div className="my-4 h-px bg-border" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href={routes.support}
                      className="flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {t("nav.support")}
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="my-2 h-px bg-border" />
                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          {t("nav.admin")}
                        </span>
                        <Link
                          href={routes.adminPokemon}
                          className="flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary pl-6"
                        >
                          <PawPrint className="h-5 w-5" />
                          {t("nav.adminPokemon")}
                        </Link>
                      </>
                    )}
                    <div className="my-2 h-px bg-border" />
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 text-lg font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                      <LogOut className="h-5 w-5" />
                      {t("nav.signOut")}
                    </button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={routes.signin}>{t("nav.signIn")}</Link>
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
