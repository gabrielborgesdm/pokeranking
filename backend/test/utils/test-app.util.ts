import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { PokemonModule } from '../../src/pokemon/pokemon.module';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';

/**
 * Creates a NestJS test application with test database configuration
 * Replicates production setup including global guards and validation pipes
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      // Global configuration module with test environment
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: false,
      }),
      // MongoDB connection using test database URI
      MongooseModule.forRoot(process.env.MONGODB_TEST_URI || '', {
        retryAttempts: 3,
        retryDelay: 500,
      }),
      // Feature modules
      AuthModule,
      UsersModule,
      PokemonModule,
    ],
    providers: [
      // Global authentication guard (same as production)
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
      // Global authorization guard (same as production)
      {
        provide: APP_GUARD,
        useClass: RolesGuard,
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same global validation pipe as production (from src/main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        exposeUnsetFields: false, // Do not expose fields that are not set, i.e., undefined;
      },
    }),
  );

  await app.init();
  return app;
}
