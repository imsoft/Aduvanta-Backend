import { z } from 'zod';

export const configSchema = z.preprocess(
  (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return raw;
    const r = raw as Record<string, unknown>;
    const apiKey =
      typeof r.BETTER_AUTH_API_KEY === 'string' &&
      r.BETTER_AUTH_API_KEY.length > 0
        ? r.BETTER_AUTH_API_KEY
        : typeof r.BETTER_AUTH_SECRET === 'string'
          ? r.BETTER_AUTH_SECRET
          : undefined;
    return { ...r, BETTER_AUTH_API_KEY: apiKey };
  },
  z.object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
    BETTER_AUTH_API_KEY: z
      .string()
      .min(32, 'BETTER_AUTH_API_KEY must be at least 32 characters'),
    BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
    CORS_ORIGIN: z.string().default('http://localhost:3001'),
    COOKIE_DOMAIN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Encryption key for secrets at rest (32-byte hex = 64 hex chars)
    ENCRYPTION_KEY: z
      .string()
      .length(64, 'ENCRYPTION_KEY must be a 64-character hex string')
      .regex(/^[0-9a-f]+$/i, 'ENCRYPTION_KEY must be hexadecimal')
      .optional(),
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    FRONTEND_URL: z.string().url().default('http://localhost:3001'),
    // S3-compatible object storage
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
  }),
);

export type AppConfig = z.infer<typeof configSchema>;
