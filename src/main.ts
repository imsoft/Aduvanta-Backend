import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/config.service.js';
import { BETTER_AUTH } from './modules/auth/auth.constants.js';
import type { BetterAuth } from './modules/auth/auth.types.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);
  const auth = app.get<BetterAuth>(BETTER_AUTH);

  // Intercept Better Auth routes before NestJS routing.
  // toNodeHandler relies on req.originalUrl to match Better Auth's basePath (/api/auth).
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      toNodeHandler(auth)(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse,
      ).catch(next);
      return;
    }
    next();
  });

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: config.get('CORS_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get('PORT');
  await app.listen(port);
}

void bootstrap();
