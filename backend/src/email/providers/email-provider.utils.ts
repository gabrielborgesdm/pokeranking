import { ConfigService } from '@nestjs/config';

export interface ProviderConfig {
  id: string;
  priority: number;
  isActive: boolean;
}

/**
 * Parses the EMAIL_PROVIDERS env variable to determine active providers and their priority.
 * Format: "resend,nodemailer" - comma-separated list where order defines priority (first = highest)
 *
 * @param configService - NestJS ConfigService
 * @param providerId - The provider ID to check
 * @returns ProviderConfig with active status and priority
 */
export function getProviderConfig(
  configService: ConfigService,
  providerId: string,
): ProviderConfig {
  const providersEnv = configService.get<string>('EMAIL_PROVIDERS', '');
  const providers = providersEnv
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 0);

  const index = providers.indexOf(providerId.toLowerCase());
  const isActive = index !== -1;

  return {
    id: providerId,
    priority: isActive ? index : -1,
    isActive,
  };
}

/**
 * Gets all configured provider IDs in priority order.
 *
 * @param configService - NestJS ConfigService
 * @returns Array of provider IDs in priority order (first = highest priority)
 */
export function getActiveProviderIds(configService: ConfigService): string[] {
  const providersEnv = configService.get<string>('EMAIL_PROVIDERS', '');
  return providersEnv
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 0);
}
