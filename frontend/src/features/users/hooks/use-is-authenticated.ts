"use client";

import { useSession } from "next-auth/react";

export function useIsAuthenticated(): boolean {
  const { data: session } = useSession();
  return !!session?.user?.id;
}
