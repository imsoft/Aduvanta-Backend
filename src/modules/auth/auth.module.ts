import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { AppConfigService } from '../../config/config.service.js';
import { BETTER_AUTH } from './auth.constants.js';

@Module({
  providers: [
    {
      provide: BETTER_AUTH,
      useFactory: async (config: AppConfigService) => {
        const { betterAuth } = await import('better-auth');

        const pool = new Pool({
          connectionString: config.get('DATABASE_URL'),
          ssl: true,
          statement_timeout: 30_000,
          idle_in_transaction_session_timeout: 60_000,
        });

        const betterAuthUrl = config.get('BETTER_AUTH_URL')
        const isProduction = config.get('NODE_ENV') === 'production'
        const isSecureCookie = isProduction || betterAuthUrl?.startsWith('https://')
        const cookieDomain = config.get('COOKIE_DOMAIN');

        const googleClientId = config.get('GOOGLE_CLIENT_ID');
        const googleClientSecret = config.get('GOOGLE_CLIENT_SECRET');

        const trustedOrigins = config
          .get('CORS_ORIGIN')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);

        return betterAuth({
          database: pool,
          baseURL: config.get('BETTER_AUTH_URL'),
          secret: config.get('BETTER_AUTH_API_KEY'),
          emailAndPassword: { enabled: true },
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
              // Importante: el navegador rechaza cookies con prefijo `__Secure-` si `Secure=false`.
              // better-auth ya decide el prefijo según el protocolo de `baseURL`, pero aquí
              // sobreescribimos `secure`, así que lo alineamos con HTTPS.
              secure: isSecureCookie,
              httpOnly: true,
              sameSite: 'lax',
            },
          },
        });
      },
      inject: [AppConfigService],
    },
  ],
  exports: [BETTER_AUTH],
})
export class AuthModule {}
