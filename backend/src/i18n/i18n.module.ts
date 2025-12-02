import { Module } from '@nestjs/common';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/'),
        watch: process.env.NODE_ENV === 'development',
      },
      resolvers: [AcceptLanguageResolver, new QueryResolver(['lang'])],
    }),
  ],
})
export class I18nConfigModule {}
