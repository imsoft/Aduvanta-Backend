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
          ssl: { rejectUnauthorized: false },
        });

        const isProduction = config.get('NODE_ENV') === 'production';
        const cookieDomain = config.get('COOKIE_DOMAIN');

        return betterAuth({
          database: pool,
          baseURL: config.get('BETTER_AUTH_URL'),
          secret: config.get('BETTER_AUTH_SECRET'),
          emailAndPassword: { enabled: true },
          trustedOrigins: [config.get('CORS_ORIGIN')],
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
              sameSite: isProduction ? 'lax' : 'lax',
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
