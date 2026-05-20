import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { TraceIdMiddleware } from './common/trace-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const config = app.get(ConfigService);

  app.use(helmet());
  // ADMIN_WEB_ORIGIN can be a single URL or comma-separated list.
  // localhost:5173 is always allowed for local dev convenience.
  const originRaw = (config.get('ADMIN_WEB_ORIGIN') as string | undefined) ?? '';
  const configured = originRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
  const allowedOrigins = Array.from(new Set([...configured, 'http://localhost:5173']));
  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.use(new TraceIdMiddleware().use);

  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
  new Logger('Bootstrap').log(`OXYGEN backend listening on http://localhost:${port}`);
}

bootstrap();
