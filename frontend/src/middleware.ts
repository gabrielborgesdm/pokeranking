import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicPaths, authPaths, adminPaths, routes } from "@/lib/routes";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;
  const { pathname } = req.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname === path);
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL(routes.home, req.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL(routes.signin, req.url));
  }

  // Require admin role for admin paths
  if (isAdminPath && token?.role !== "admin") {
    return NextResponse.redirect(new URL(routes.home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
