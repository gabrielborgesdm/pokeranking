"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { publicPaths, publicExactPaths, authPaths, routes } from "@/lib/routes";
import * as Sentry from "@sentry/nextjs";


export function AuthRedirect() {
  const { status, data } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const isPublicPath =
      publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      ) || publicExactPaths.some((path) => pathname === path);

    const isAuthPath = authPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    const isAuthenticated = status === "authenticated";
    const user = data?.user;

    if (isAuthenticated && user?.username) {
      Sentry.setUser({
        id: user.id,
        email: user.email, // optional
        username: user.username, // optional
      });
    }

    // If user is authenticated and trying to access auth paths, redirect to home
    if (isAuthenticated && isAuthPath) {
      router.replace(routes.home);
      return;
    }

    // If path is not public/auth and user is not authenticated, redirect to signin
    if (!isPublicPath && !isAuthPath && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`${routes.signin}?callbackUrl=${callbackUrl}`);
    }
  }, [status, pathname, router]);

  return null;
}
