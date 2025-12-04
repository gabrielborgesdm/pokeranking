import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentryService } from './sentry.service';

@Global()
@Module({
  providers: [
    {
      provide: 'SENTRY_INIT',
      useFactory: (configService: ConfigService) => {
        const dsn = configService.get<string>('SENTRY_DSN');
        // Sentry is initialized in instrument.ts before NestJS bootstrap
        return { initialized: !!dsn };
      },
      inject: [ConfigService],
    },
    SentryService,
  ],
  exports: [SentryService],
})
export class SentryModule {}
