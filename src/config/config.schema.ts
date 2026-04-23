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
    COOKIE_SECRET: z.string().min(32).optional(),
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
    // Email (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),
    // Acepta tanto "no-reply@aduvanta.com" como el formato RFC 5322 con
     // display name "Aduvanta <no-reply@aduvanta.com>". Resend/Nodemailer
     // consumen cualquiera de los dos, así que solo validamos que haya un
     // carácter `@`.
    EMAIL_FROM: z
      .string()
      .min(3)
      .refine((v) => v.includes('@'), 'EMAIL_FROM must contain an email address')
      .default('Aduvanta <no-reply@aduvanta.com>'),
    EMAIL_VERIFICATION_REQUIRED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    SYSTEM_ADMIN_EMAIL: z.string().email().optional(),
    MAX_UPLOAD_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .default(25 * 1024 * 1024),
    PG_POOL_MAX: z.coerce.number().int().positive().default(10),
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
  }).superRefine((data, ctx) => {
    // In production, reject obviously-unsafe CORS configurations.
    if (data.NODE_ENV === 'production') {
      const origins = data.CORS_ORIGIN.split(',').map((o) => o.trim());
      const forbidden = origins.filter(
        (o) =>
          o === '*' ||
          o.startsWith('http://') ||
          o.includes('localhost') ||
          o.includes('127.0.0.1'),
      );
      if (forbidden.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGIN'],
          message: `CORS_ORIGIN contains values not allowed in production: ${forbidden.join(', ')}. Require HTTPS origins only.`,
        });
      }
      if (data.BETTER_AUTH_URL.startsWith('http://')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['BETTER_AUTH_URL'],
          message: 'BETTER_AUTH_URL must use HTTPS in production.',
        });
      }
    }
  }),
);

export type AppConfig = z.infer<typeof configSchema>;
