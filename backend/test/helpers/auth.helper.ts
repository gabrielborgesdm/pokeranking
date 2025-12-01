import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RegisterDto } from '../../src/auth/dto/register.dto';

/**
 * Logs in a user and returns the JWT access token
 * @param app - NestJS application instance
 * @param credentials - Username and password credentials
 * @returns JWT access token
 */
export async function loginUser(
  app: INestApplication,
  credentials: { username: string; password: string },
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials)
    .expect(200);

  return response.body.access_token as string;
}

/**
 * Formats a JWT token into an Authorization header value
 * @param token - JWT access token
 * @returns Formatted Bearer token string
 */
export function getAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Registers a new user and returns the token and user ID
 * @param app - NestJS application instance
 * @param userData - User registration data
 * @returns Object with access token and user ID
 */
export async function registerUser(
  app: INestApplication,
  userData: RegisterDto,
): Promise<{ token: string; userId: string }> {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  return {
    token: response.body.access_token as string,
    userId: response.body.user.id as string,
  };
}

/**
 * Convenience function to register a user and return just the token
 * @param app - NestJS application instance
 * @param userData - User registration data
 * @returns JWT access token
 */
export async function registerAndLogin(
  app: INestApplication,
  userData: RegisterDto,
): Promise<string> {
  const { token } = await registerUser(app, userData);
  return token;
}
