import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = () => SetMetadata(RATE_LIMIT_KEY, true);
