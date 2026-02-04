import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { isApiError, setAuthToken, getAuthToken } from "@pokeranking/api-client";
import i18n from "@/i18n";
import { routes } from "@/lib/routes";

let isHandling = false;

export function handleSessionExpired(error: unknown): boolean {
  if (!isApiError(error) || error.status !== 401) {
    return false;
  }

  // Only show "session expired" if user had a token (was logged in)
  // If no token, they weren't authenticated - just ignore the 401
  const hadToken = !!getAuthToken();
  if (!hadToken) {
    return false;
  }

  if (isHandling) return true;
  isHandling = true;

  setAuthToken(null);

  toast.error(i18n.t("toast.sessionExpired"), {
    description: i18n.t("toast.sessionExpiredDescription"),
    duration: 3000,
  });

  setTimeout(() => {
    signOut({ callbackUrl: routes.signin });
    setTimeout(() => {
      isHandling = false;
    }, 1000);
  }, 1500);

  return true;
}
