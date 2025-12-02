import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { PokemonModule } from '../../src/pokemon/pokemon.module';
import { RankingsModule } from '../../src/rankings/rankings.module';
import { BoxesModule } from '../../src/boxes/boxes.module';
import { CommonModule } from '../../src/common/common.module';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { I18nExceptionFilter } from '../../src/i18n/filters/i18n-exception.filter';

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
      // Common module (global)
      CommonModule,
      // I18n module for tests
      I18nModule.forRoot({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: join(__dirname, '../../src/i18n/'),
          watch: false,
        },
        resolvers: [AcceptLanguageResolver, new QueryResolver(['lang'])],
      }),
      // Feature modules
      AuthModule,
      UsersModule,
      PokemonModule,
      RankingsModule,
      BoxesModule,
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
      // Global i18n exception filter (same as production)
      {
        provide: APP_FILTER,
        useClass: I18nExceptionFilter,
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
