import { Module, Logger, OnModuleInit } from '@nestjs/common';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  I18nJsonLoader,
} from 'nestjs-i18n';
import * as path from 'path';
import * as fs from 'fs';

function resolveI18nPath() {
  return process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'dist/src/i18n')
    : path.join(process.cwd(), 'src/i18n');
}

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: resolveI18nPath(),
        watch: process.env.NODE_ENV === 'development',
      },
      resolvers: [
        AcceptLanguageResolver,
        new QueryResolver(['lang', 'locale']),
      ],
    }),
  ],
})
export class I18nConfigModule implements OnModuleInit {
  private readonly logger = new Logger(I18nConfigModule.name);

  onModuleInit() {
    this.logger.log(`i18n path: ${resolveI18nPath()}`);
    this.logger.log(`__dirname: ${__dirname}`);

    // Check if translation files exist
    const languageDirs = ['en', 'pt-BR'];
    languageDirs.forEach((lang) => {
      const langPath = path.join(resolveI18nPath(), lang);
      const exists = fs.existsSync(langPath);
      this.logger.log(`${lang} directory exists: ${exists} (${langPath})`);

      if (exists) {
        const files = fs.readdirSync(langPath);
        this.logger.log(`${lang} files: ${files.join(', ')}`);
      }
    });
  }
}
