import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe for DTOs
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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Pokemon Ranking API')
    .setDescription('API for managing Pokemon and user rankings')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('pokemon', 'Pokemon management endpoints')
    .addTag('boxes', 'Box management and community favoriting')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const port = process.env.PORT ?? 3000;

  // Only enable Swagger in development/staging

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Pokemon Ranking API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

void bootstrap();
