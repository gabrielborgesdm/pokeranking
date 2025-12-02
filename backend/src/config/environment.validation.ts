import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import type { StringValue } from 'ms';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  @IsOptional()
  MONGODB_USER?: string;

  @IsString()
  @IsOptional()
  MONGODB_PASSWORD?: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION?: StringValue;

  @IsString()
  @IsOptional()
  ALLOWED_IMAGE_DOMAINS?: string;

  @IsBoolean()
  @IsOptional()
  EMAIL_VERIFICATION_REQUIRED?: boolean;

  @IsString()
  @IsOptional()
  VERIFICATION_TOKEN_EXPIRATION?: StringValue;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsEmail()
  RESEND_FROM_EMAIL: string;

  @IsString()
  UPSTASH_REDIS_URL: string;

  @IsString()
  UPSTASH_REDIS_TOKEN: string;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_VERIFY_EMAIL?: number;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_RESEND_EMAIL?: number;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_SECONDS?: number;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Set default for ALLOWED_IMAGE_DOMAINS
  if (!validatedConfig.ALLOWED_IMAGE_DOMAINS) {
    validatedConfig.ALLOWED_IMAGE_DOMAINS = 'res.cloudinary.com';
  }

  return validatedConfig;
}
