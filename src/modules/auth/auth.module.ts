import { Module } from '@nestjs/common';
import type { Pool } from 'pg';
import type Redis from 'ioredis';
import { AppConfigService } from '../../config/config.service.js';
import { DATABASE_POOL } from '../../database/database.module.js';
import { REDIS } from '../../redis/redis.module.js';
import { EmailService } from '../email/email.service.js';
import { BETTER_AUTH } from './auth.constants.js';

@Module({
  providers: [
    {
      provide: BETTER_AUTH,
      useFactory: async (
        config: AppConfigService,
        emailService: EmailService,
        pool: Pool,
        redis: Redis,
      ) => {
        const { betterAuth } = await import('better-auth');

        const betterAuthUrl = config.get('BETTER_AUTH_URL');
        const isProduction = config.get('NODE_ENV') === 'production';
        const isSecureCookie =
          isProduction || betterAuthUrl?.startsWith('https://');
        const cookieDomain = config.get('COOKIE_DOMAIN');
        const frontendUrl = config.get('FRONTEND_URL');
        const emailVerificationRequired = config.get(
          'EMAIL_VERIFICATION_REQUIRED',
        );

        const googleClientId = config.get('GOOGLE_CLIENT_ID');
        const googleClientSecret = config.get('GOOGLE_CLIENT_SECRET');

        const trustedOrigins = config
          .get('CORS_ORIGIN')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);

        return betterAuth({
          database: pool,
          baseURL: betterAuthUrl,
          secret: config.get('BETTER_AUTH_API_KEY'),
          secondaryStorage: {
            get: (key) => redis.get(`ba:${key}`),
            set: (key, value, ttl) => {
              if (ttl) {
                return redis.set(`ba:${key}`, value, 'EX', ttl).then(() => {});
              }
              return redis.set(`ba:${key}`, value).then(() => {});
            },
            delete: (key) => redis.del(`ba:${key}`).then(() => {}),
          },
          emailAndPassword: {
            enabled: true,
            minPasswordLength: 12,
            maxPasswordLength: 128,
            autoSignIn: !emailVerificationRequired,
            requireEmailVerification: emailVerificationRequired,
            sendResetPassword: async ({ user, url }) => {
              await emailService.sendPasswordReset({
                to: user.email,
                userName: user.name ?? user.email.split('@')[0] ?? 'Usuario',
                resetUrl: url,
              });
            },
          },
          emailVerification: {
            sendOnSignUp: emailVerificationRequired,
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({ user, url }) => {
              const callbackUrl = new URL(url);
              callbackUrl.searchParams.set('callbackURL', frontendUrl);
              await emailService.sendVerification({
                to: user.email,
                userName: user.name ?? user.email.split('@')[0] ?? 'Usuario',
                verifyUrl: callbackUrl.toString(),
              });
            },
          },
          rateLimit: {
            // En desarrollo los valores estrictos bloquean rápidamente
            // (HMR, sesión que refresca, reintentos manuales de login). Solo
            // habilitamos el rate-limit en producción; en dev confiamos en
            // las devtools del navegador.
            enabled: isProduction,
            window: 60,
            max: 100,
            customRules: {
              '/sign-in/email': { window: 900, max: 20 },
              '/sign-up/email': { window: 3600, max: 10 },
              '/forget-password': { window: 900, max: 5 },
              '/reset-password': { window: 900, max: 5 },
            },
          },
          socialProviders: {
            ...(googleClientId && googleClientSecret
              ? {
                  google: {
                    clientId: googleClientId,
                    clientSecret: googleClientSecret,
                  },
                }
              : {}),
          },
          trustedOrigins,
          advanced: {
            ...(cookieDomain
              ? {
                  crossSubDomainCookies: {
                    enabled: true,
                    domain: cookieDomain,
                  },
                }
              : {}),
            defaultCookieAttributes: {
              // El navegador rechaza cookies con prefijo `__Secure-` si `Secure=false`.
              // better-auth ya decide el prefijo según el protocolo de `baseURL`,
              // pero aquí sobreescribimos `secure`, así que lo alineamos con HTTPS.
              secure: isSecureCookie,
              httpOnly: true,
              sameSite: 'lax',
            },
          },
        });
      },
      inject: [AppConfigService, EmailService, DATABASE_POOL, REDIS],
    },
  ],
  exports: [BETTER_AUTH],
})
export class AuthModule {}
