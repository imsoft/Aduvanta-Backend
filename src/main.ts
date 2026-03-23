import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { getBetterAuthNode } from './common/better-auth-node.loader.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/config.service.js';
import { BETTER_AUTH } from './modules/auth/auth.constants.js';
import type { BetterAuth } from './modules/auth/auth.types.js';
import { RateLimitService } from './common/rate-limit/rate-limit.service.js';
import { AbuseDetectionService } from './common/abuse-detection/abuse-detection.service.js';
import { AbuseSignalInterceptor } from './common/abuse-detection/abuse-signal.interceptor.js';
import { EventTrackingInterceptor } from './modules/event-tracking/event-tracking.interceptor.js';

async function bootstrap(): Promise<void> {
  const { toNodeHandler } = await getBetterAuthNode();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);
  const auth = app.get<BetterAuth>(BETTER_AUTH);
  const rateLimitService = app.get(RateLimitService);
  const abuseDetectionService = app.get(AbuseDetectionService);

  const logger = app.get(Logger);

  // Stripe webhooks require the raw body for signature verification.
  // Must be registered before the JSON parser.
  app.use(
    '/api/stripe/webhooks',
    express.raw({ type: 'application/json', limit: '1mb' }),
  );

  // Parse JSON bodies early so auth middleware can read req.body.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // --- Auth rate limiter + account lockout (Redis-backed) ---
  const LOCKOUT_THRESHOLD = 5;
  const LOCKOUT_WINDOW_MS = 15 * 60_000; // 15 minutes

  // Intercept Better Auth routes before NestJS routing.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }

    const ip = extractIp(req);

    // Account lockout check for sign-in endpoint.
    const isSignIn = req.originalUrl.includes('/sign-in');
    if (isSignIn && req.method === 'POST') {
      const body = req.body as { email?: string } | undefined;
      const email =
        typeof body?.email === 'string' ? body.email.toLowerCase() : null;

      if (email) {
        const lockoutKey = `lockout:${email}`;

        // Check lockout status in Redis
        void rateLimitService
          .peek(lockoutKey, LOCKOUT_WINDOW_MS)
          .then((failedCount) => {
            if (failedCount >= LOCKOUT_THRESHOLD) {
              logger.warn(
                { email, ip },
                'Account temporarily locked due to repeated failed login attempts',
              );

              void abuseDetectionService.recordSignal({
                ip,
                action: 'account_lockout',
                path: req.originalUrl,
                method: req.method,
                userAgent: req.headers['user-agent'],
              });

              res.status(423).json({
                message: 'Account temporarily locked. Try again later.',
              });
              return;
            }

            // Intercept the response to detect failed logins.
            const originalJson = res.json.bind(res);
            res.json = function (responseBody: unknown) {
              const status = res.statusCode;
              if (status >= 400 && email) {
                // Record failed login in Redis sliding window
                void rateLimitService.check(
                  lockoutKey,
                  LOCKOUT_THRESHOLD + 10,
                  LOCKOUT_WINDOW_MS,
                );

                void abuseDetectionService.recordSignal({
                  ip,
                  action: 'auth_failure',
                  path: req.originalUrl,
                  method: req.method,
                  userAgent: req.headers['user-agent'],
                  metadata: { email },
                });

                logger.warn({ email, ip, status }, 'Failed login attempt');
              }
              // Clear lockout counter on successful login.
              if (status < 300 && email) {
                void rateLimitService.reset(lockoutKey);
              }
              return originalJson(responseBody);
            };

            toNodeHandler(auth)(
              req as unknown as IncomingMessage,
              res as unknown as ServerResponse,
            ).catch(next);
          });
        return;
      }
    }

    toNodeHandler(auth)(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse,
    ).catch(next);
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
          imgSrc: ["'none'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      hsts: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    }),
  );
  app.use(cookieParser());

  // CORS — supports comma-separated origins for multi-subdomain deployment.
  const corsOrigins = config
    .get('CORS_ORIGIN')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-organization-id',
      'Idempotency-Key',
    ],
  });

  app.setGlobalPrefix('api');

  // GET / — sin prefijo /api; evita 404 al abrir la URL base del API en el navegador
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'aduvanta-api',
      health: '/api/health',
    });
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    app.get(AbuseSignalInterceptor),
    app.get(EventTrackingInterceptor),
  );

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

function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

void bootstrap();
