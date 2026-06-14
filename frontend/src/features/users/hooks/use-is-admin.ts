"use client";

import { useSession } from "next-auth/react";
import type { UserResponseDtoRole } from "@pokeranking/api-client";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  const role = session?.user?.role as UserResponseDtoRole | undefined;
  return role === "admin" || role === "moderator";
}
