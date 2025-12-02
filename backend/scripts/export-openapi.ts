import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function exportOpenApiSpec() {
  // Create the app without listening
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Build the same Swagger config as main.ts
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

  // Output path - to the api-client package
  const outputPath = path.resolve(
    __dirname,
    '../../packages/api-client/openapi.json',
  );

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the spec
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`OpenAPI spec exported to: ${outputPath}`);

  await app.close();
}

exportOpenApiSpec().catch((error) => {
  console.error('Failed to export OpenAPI spec:', error);
  process.exit(1);
});
