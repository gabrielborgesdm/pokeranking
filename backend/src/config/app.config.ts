import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:3001';

export const getCorsConfig = (configService: ConfigService): CorsOptions => {
  const originConfig =
    configService.get<string>('CORS_ORIGIN') || DEFAULT_CORS_ORIGIN;

  // Support multiple origins separated by comma
  const origins = originConfig.split(',').map((o) => o.trim());
  const origin = origins.length === 1 ? origins[0] : origins;

  return {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  };
};
