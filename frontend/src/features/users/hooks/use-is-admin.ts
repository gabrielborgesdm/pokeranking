"use client";

import { useSession } from "next-auth/react";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  const role = session?.user?.role as any;
  return role === "admin" || role === "moderator";
}
