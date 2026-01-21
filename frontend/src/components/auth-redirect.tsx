"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { publicPaths, authPaths, routes } from "@/lib/routes";

export function AuthRedirect() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    const isAuthPath = authPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    const isAuthenticated = status === "authenticated";

    // If user is authenticated and trying to access auth paths, redirect to home
    if (isAuthenticated && isAuthPath) {
      router.replace(routes.home);
      return;
    }

    // If path is not public and user is not authenticated, redirect to signin
    if (!isPublicPath && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`${routes.signin}?callbackUrl=${callbackUrl}`);
    }
  }, [status, pathname, router]);

  return null;
}
