import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { RankingsModule } from './rankings/rankings.module';
import { BoxesModule } from './boxes/boxes.module';
import { SupportModule } from './support/support.module';
import { UploadModule } from './upload/upload.module';
import { CommonModule } from './common/common.module';
import { SentryModule } from './sentry/sentry.module';
import { I18nConfigModule } from './i18n/i18n.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { I18nExceptionFilter } from './i18n/filters/i18n-exception.filter';
import { validate } from './config/environment.validation';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Common module (global)
    CommonModule,
    // Sentry module (global)
    SentryModule,
    // I18n module
    I18nConfigModule,
    // Feature modules
    AuthModule,
    UsersModule,
    PokemonModule,
    RankingsModule,
    BoxesModule,
    SupportModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    // Global authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global authorization guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global i18n exception filter
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilter,
    },
  ],
})
export class AppModule {}
