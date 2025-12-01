import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsOptional,
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
