import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:8081', 'http://localhost:19006'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
