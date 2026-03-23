import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { AppConfigService } from '../../config/config.service.js';
import { BETTER_AUTH } from './auth.constants.js';

@Module({
  providers: [
    {
      provide: BETTER_AUTH,
      useFactory: (config: AppConfigService) => {
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL'),
          ssl: true,
          statement_timeout: 30_000,
          idle_in_transaction_session_timeout: 60_000,
        });

        const isProduction = config.get('NODE_ENV') === 'production';
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
          secret: config.get('BETTER_AUTH_SECRET'),
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
              secure: isProduction,
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
