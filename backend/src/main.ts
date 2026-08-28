import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Bootstraps the PayFlow API.
 *
 * Security notes (this is a payments API, so these are load-bearing, not decoration):
 *  - helmet() sets sane security headers (no sniffing, no framing, HSTS, etc.)
 *  - a global ValidationPipe rejects any request body field that isn't explicitly
 *    declared on a DTO (`whitelist` + `forbidNonWhitelisted`) instead of silently
 *    dropping or passing through unexpected fields.
 *  - CORS is locked to an explicit origin allowlist read from env, never `*`.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PayFlow API listening on http://localhost:${port}/api/v1`);
}

bootstrap();
