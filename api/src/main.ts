import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MindMate API')
    .setDescription('Mental wellness and journaling platform API with AI-powered insights')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication and user management (login, signup, Google OAuth)')
    .addTag('Users', 'User profile and personality management')
    .addTag('Journal', 'Journal entries and mental health tracking')
    .addTag('Insights', 'AI-generated insights from journal entries')
    .addTag('AI', 'AI pipeline and natural language processing')
    .addTag('Voice', 'Text-to-speech and speech-to-text services')
    .addTag('Plugins', 'Plugin management and installation')
    .addTag('System', 'System health checks and utilities')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (e.g., Bearer <token>)',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api-docs', app, document);

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:8081', 'http://localhost:19006'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
