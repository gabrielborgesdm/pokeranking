import { TFunction } from "i18next";
import { ApiError } from "@pokeranking/api-client";

/**
 * Translates an API error using the frontend i18n system.
 *
 * The backend sends errors with a `key` field (e.g., "auth.invalidCredentials")
 * and optional `args` for interpolation (e.g., { email: "user@example.com" }).
 *
 * @param error - The ApiError from the API client
 * @param t - The translation function from useTranslation()
 * @returns The translated error message, or fallback to raw message
 *
 * @example
 * // Backend returns: { key: "users.emailExists", args: { email: "foo@bar.com" }, message: "users.emailExists" }
 * // Frontend translates: "User with email "foo@bar.com" already exists"
 *
 * onError: (err) => {
 *   if (isApiError(err)) {
 *     setError(translateApiError(err, t));
 *   }
 * }
 */
export function translateApiError(error: ApiError, t: TFunction): string {
  const { key, args, message } = error.data;

  // If we have a translation key, try to translate it
  if (key) {
    const translationKey = `apiErrors.${key}`;
    const translated = t(translationKey, args ?? {});

    // i18next returns the key if translation is not found
    // In that case, fall back to the raw message
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Fallback to the raw message from the backend
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  return message;
}
