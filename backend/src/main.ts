import 'reflect-metadata';

// Sentry must be imported before any other imports
import './sentry/instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/app.config';
import { CustomLogger } from './common/logger/custom.logger';

// Set Sentry initialized flag based on env var (Sentry is initialized in instrument.ts)
CustomLogger.setSentryInitialized(!!process.env.SENTRY_DSN);


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger('Bootstrap'),
  });

  const configService = app.get(ConfigService);

  app.enableCors(getCorsConfig(configService));

  app.use((req, res, next) => {
    res.setHeader('Vary', 'Origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        exposeUnsetFields: false,
        enableImplicitConversion: true,
      },
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Pokemon Ranking API')
      .setDescription('API for managing Pokemon and user rankings')
      .setVersion('1.0')
      .addTag('auth')
      .addTag('users')
      .addTag('pokemon')
      .addTag('boxes')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Pokemon Ranking API Docs',
      swaggerOptions: { persistAuthorization: true },
    });
  }

  if (process.env.deployment_type !== 'serverless') {
    const port = configService.get<number>('PORT', 8000);
    await app.listen(port);
  } else {
    await app.init();
  }

  return app.getHttpAdapter().getInstance();
}

const server = bootstrap();

export default server;