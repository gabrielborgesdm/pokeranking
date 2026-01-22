import { useMemo } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook to determine if the current user is the owner of a resource
 *
 * @param ownerId - The user ID of the resource owner
 * @returns true if the current session user ID matches the owner ID
 */
export function useIsOwner(ownerId: string | undefined | null): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.id || !ownerId) {
      return false;
    }
    return session.user.id === ownerId;
  }, [session?.user?.id, ownerId]);
}

/**
 * Hook to determine if the current user is viewing their own profile page
 *
 * @param pageUsername - The username from the page URL
 * @returns true if the current session username matches the page username
 */
export function useIsCurrentUser(pageUsername: string | undefined | null): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.username || !pageUsername) {
      return false;
    }
    return session.user.username === pageUsername;
  }, [session?.user?.username, pageUsername]);
}
