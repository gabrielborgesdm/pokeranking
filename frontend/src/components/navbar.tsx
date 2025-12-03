"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import { Menu, Settings, LogOut, User, Trophy, Info, Palette, LucideIcon } from "lucide-react";
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
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

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

const checkIsAuthenticated = (status: string) => status === "authenticated";

export function Navbar() {
  const { t } = useTranslation();
  const { isDark, ThemeIcon, toggleTheme } = useThemeContext();
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = checkIsAuthenticated(status);

  const navLinks: NavLink[] = [
    { href: routes.home, label: t("nav.leaderboard"), icon: Trophy },
    { href: routes.about, label: t("nav.about"), icon: Info },
    { href: routes.design, label: t("nav.design"), icon: Palette },
  ];

  return (
    <header className="top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Logo className="mr-6" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-6">
          <NavLinks links={navLinks} pathname={pathname} variant="desktop" />
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
                  <Link href={routes.settings}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
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
                <NavLinks links={navLinks} pathname={pathname} variant="mobile" />
                <div className="my-4 h-px bg-border" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href={routes.settings}
                      className="flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <Settings className="h-5 w-5" />
                      {t("nav.settings")}
                    </Link>
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
