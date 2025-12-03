"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { authPaths } from "@/lib/routes";

export function ConditionalNavbar() {
  const pathname = usePathname();
  const isAuthRoute = authPaths.some((path) => pathname === path);

  if (isAuthRoute) {
    return null;
  }

  return <Navbar />;
}
