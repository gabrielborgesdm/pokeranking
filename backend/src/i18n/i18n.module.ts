import { Module, Logger, OnModuleInit } from '@nestjs/common';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  I18nJsonLoader,
} from 'nestjs-i18n';
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';
const i18nPath = isDev ? path.join(__dirname, '/') : path.join(process.cwd(), 'dist/src/i18n');

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: i18nPath,
        watch: isDev,
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
    this.logger.log(`i18n path: ${i18nPath}`);
    this.logger.log(`__dirname: ${__dirname}`);

    // Check if translation files exist
    const languageDirs = ['en', 'pt-BR'];
    languageDirs.forEach((lang) => {
      const langPath = path.join(i18nPath, lang);
      const exists = fs.existsSync(langPath);
      this.logger.log(`${lang} directory exists: ${exists} (${langPath})`);

      if (exists) {
        const files = fs.readdirSync(langPath);
        this.logger.log(`${lang} files: ${files.join(', ')}`);
      }
    });
  }
}
