"use client";

import { useSession } from "next-auth/react";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === "admin";
}
