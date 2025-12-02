import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:3001';

export const getCorsConfig = (configService: ConfigService): CorsOptions => {
  const origin = configService.get<string>('CORS_ORIGIN') || DEFAULT_CORS_ORIGIN;

  return {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  };
};
