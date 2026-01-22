"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, User, Heart, Palette, List, Layers, MessageSquare, Shield, PawPrint, LucideIcon, ChevronDown, Globe, Check, Sun, Moon, Users, BookOpen, Settings } from "lucide-react";
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
import { useIsAdmin } from "@/features/users";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useThemeContext } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { Logo } from "@/components/logo";
import { RankingsDropdown } from "@/components/rankings-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { useAnalytics } from "@/hooks/use-analytics";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";

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
          <Link href={routes.account}>
            <Settings className="mr-2 h-4 w-4" />
            {t("nav.myAccount")}
          </Link>
        </DropdownMenuItem>
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
  className?: string;
}

interface NavLinksProps {
  links: NavLink[];
  pathname: string;
  variant?: "desktop" | "mobile";
}

function NavLinks({ links, pathname, variant = "desktop" }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                link.className
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

  return (
    <div className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all",
              isActive
                ? "bg-muted font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

interface MobileNavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  indent?: boolean;
}

function MobileNavLink({ href, icon: Icon, label, pathname, indent }: MobileNavLinkProps) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all",
        indent && "ml-4",
        isActive
          ? "bg-muted font-semibold text-foreground"
          : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { isDark, ThemeIcon, toggleTheme } = useThemeContext();
  const { language, setLanguage, languages } = useLanguage();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { trackThemeToggle } = useAnalytics();
  useBackButtonDialog(mobileMenuOpen, () => setMobileMenuOpen(false));

  const handleMobileMenuChange = (open: boolean) => {
    setMobileMenuOpen(open);

  };

  const handleThemeToggle = () => {
    toggleTheme();
    trackThemeToggle(isDark ? "light" : "dark");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Desktop nav links (without My Rankings - it uses the dropdown)
  const desktopNavLinks: NavLink[] = [
    { href: routes.rankings, label: t("nav.browseRankings"), icon: Layers },
    { href: routes.users, label: t("nav.users"), icon: Users },
    { href: routes.pokedex, label: t("nav.pokedex"), icon: BookOpen },
    { href: routes.contribute, label: t("nav.contribute"), icon: Heart, className: "hidden lg:flex" },
  ];

  // Mobile nav links (includes My Rankings as simple link)
  const username = session?.user?.username ?? "";
  const mobileNavLinks: NavLink[] = [
    { href: routes.rankings, label: t("nav.browseRankings"), icon: Layers },
    { href: routes.users, label: t("nav.users"), icon: Users },
    ...(isAuthenticated && username
      ? [{ href: routes.userRankings(username), label: t("nav.myRankings"), icon: List }]
      : []),
    { href: routes.pokedex, label: t("nav.pokedex"), icon: BookOpen },
    { href: routes.contribute, label: t("nav.contribute"), icon: Heart },
  ];

  return (
    <header className="top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={cn("mx-auto flex h-16 items-center px-4 md:px-8 md:py-10")}>
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
                toggleTheme={handleThemeToggle}
              />
            </>
          ) : (
            <>

              {/* Language selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
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
              <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                <ThemeIcon className="h-5 w-5" />
                <span className="sr-only">{t("nav.toggleTheme")}</span>
              </Button>
              <Button variant="outline" className="ml-2" asChild>
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
          <Sheet open={mobileMenuOpen} onOpenChange={handleMobileMenuChange}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
              {/* Header */}
              <SheetHeader className={cn("px-6 py-4", !(isAuthenticated && session?.user?.username) && "border-b")}>
                <SheetTitle className="flex items-center gap-2">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              {/* User greeting */}
              {isAuthenticated && session?.user?.username && (
                <div className="px-6 py-4 border-y bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">{t("nav.welcome")}</p>
                      <p className="font-medium truncate">{session.user.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main navigation */}
              <div className="relative flex-1 min-h-0">
                <nav className="h-full overflow-y-auto px-4 py-4">
                  <NavLinks links={mobileNavLinks} pathname={pathname} variant="mobile" />

                  {/* Secondary links */}
                  {isAuthenticated && (
                    <>
                      <div className="my-4 h-px bg-border" />
                      <div className="flex flex-col gap-1">
                        <MobileNavLink
                          href={routes.account}
                          icon={Settings}
                          label={t("nav.myAccount")}
                          pathname={pathname}
                        />
                        <MobileNavLink
                          href={routes.support}
                          icon={MessageSquare}
                          label={t("nav.support")}
                          pathname={pathname}
                        />
                        <MobileNavLink
                          href={routes.design}
                          icon={Palette}
                          label={t("nav.design")}
                          pathname={pathname}
                        />
                      </div>
                    </>
                  )}

                  {/* Admin section */}
                  {isAdmin && (
                    <>
                      <div className="my-4 h-px bg-border" />
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("nav.admin")}
                      </p>
                      <div className="flex flex-col gap-1">
                        <MobileNavLink
                          href={routes.adminPokemon}
                          icon={PawPrint}
                          label={t("nav.adminPokemon")}
                          pathname={pathname}
                        />
                      </div>
                    </>
                  )}
                </nav>
                {/* Scroll fade indicator */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
              </div>

              {/* Footer with settings and sign out */}
              <div className="mt-auto border-t px-4 py-4">
                {/* Settings row */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  {/* Theme toggle */}
                  <button
                    onClick={handleThemeToggle}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? t("nav.lightMode") : t("nav.darkMode")}
                  </button>

                  {/* Language selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                        <Globe className="h-4 w-4" />
                        {languages.find(l => l.code === language)?.label ?? language}
                      </button>
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
                </div>

                {/* Sign in/out */}
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={routes.signin}>
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.signIn")}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
