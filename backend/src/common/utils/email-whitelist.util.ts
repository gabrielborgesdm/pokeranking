import { ConfigService } from '@nestjs/config';

/**
 * Checks if an email is allowed based on the EMAIL_WHITELIST environment variable.
 * If EMAIL_WHITELIST is not set, all emails are allowed.
 * The whitelist supports comma-separated values for multiple allowed emails.
 *
 * @param configService - NestJS ConfigService instance
 * @param email - Email address to check
 * @returns true if email is allowed, false otherwise
 */
export function isEmailWhitelisted(
  configService: ConfigService,
  email: string,
): boolean {
  const whitelist = configService.get<string>('EMAIL_WHITELIST');

  if (!whitelist) {
    return true;
  }

  const allowedEmails = whitelist
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  if (allowedEmails.length === 0) {
    return true;
  }

  return allowedEmails.includes(email.toLowerCase());
}
