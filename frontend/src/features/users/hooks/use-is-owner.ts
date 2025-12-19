import { useMemo } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook to determine if the current user is the owner of a resource
 *
 * @param ownerUsername - The username of the resource owner
 * @returns true if the current session user matches the owner username
 */
export function useIsOwner(ownerUsername: string | undefined | null): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.username || !ownerUsername) {
      return false;
    }
    return session.user.username === ownerUsername;
  }, [session?.user?.username, ownerUsername]);
}
