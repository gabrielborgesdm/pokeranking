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
  FRONTEND_URL: string;

  // Email Configuration
  @IsString()
  @IsOptional()
  EMAIL_PROVIDERS?: string;

  // Resend Provider
  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  RESEND_FROM_EMAIL?: string;

  // Nodemailer/SMTP Provider
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM?: string;

  // Nodemailer 2/SMTP Provider (fallback)
  @IsString()
  @IsOptional()
  SMTP_HOST_2?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT_2?: number;

  @IsString()
  @IsOptional()
  SMTP_USER_2?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS_2?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM_2?: string;

  @IsBoolean()
  @IsOptional()
  CACHE_DISABLED?: boolean;

  @IsString()
  @IsOptional()
  UPSTASH_REDIS_URL?: string;

  @IsString()
  @IsOptional()
  UPSTASH_REDIS_TOKEN?: string;

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

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT?: string;

  @IsEmail()
  @IsOptional()
  SUPPORT_EMAIL?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  IMAGE_PROVIDER?: string;

  @IsString()
  @IsOptional()
  IMAGEKIT_PUBLIC_KEY?: string;

  @IsString()
  @IsOptional()
  IMAGEKIT_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  IMAGEKIT_URL_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  EMAIL_WHITELIST?: string;
}

export function validate(config: Record<string, unknown>) {
  const defaultValues = {
    ALLOWED_IMAGE_DOMAINS: 'res.cloudinary.com,ik.imagekit.io',
    CACHE_DISABLED: false,
    CORS_ORIGIN: 'http://localhost:3000',
    PORT: 8000,
    RATE_LIMIT_VERIFY_EMAIL: 5,
    RATE_LIMIT_RESEND_EMAIL: 5,
    RATE_LIMIT_WINDOW_SECONDS: 60,
  };

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    { ...defaultValues, ...config },
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
