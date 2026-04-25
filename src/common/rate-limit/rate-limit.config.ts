/**
 * Rate limit configuration per endpoint category and subscription plan.
 *
 * Structure:
 *   RATE_LIMITS[category][plan] = { limit, windowMs }
 *
 * Categories match the @RateLimit() decorator value on controllers.
 * Plans come from the user's subscription (free, starter, professional, enterprise).
 *
 * The 'default' plan is the fallback when plan lookup fails or user is unauthenticated.
 */

type PlanLimits = {
  limit: number;
  windowMs: number;
};

type PlanKey = 'default' | 'free' | 'starter' | 'professional' | 'enterprise';

type RateLimitConfig = Record<string, Record<PlanKey, PlanLimits>>;

const MINUTE = 60_000;
const HOUR = 3_600_000;

export const RATE_LIMITS: RateLimitConfig = {
  /**
   * Global default — applied when no specific category is set.
   */
  global: {
    default: { limit: 200, windowMs: MINUTE },
    free: { limit: 200, windowMs: MINUTE },
    starter: { limit: 400, windowMs: MINUTE },
    professional: { limit: 800, windowMs: MINUTE },
    enterprise: { limit: 2000, windowMs: MINUTE },
  },

  /**
   * Authentication endpoints — strict limits to prevent credential stuffing.
   */
  auth: {
    default: { limit: 10, windowMs: MINUTE },
    free: { limit: 10, windowMs: MINUTE },
    starter: { limit: 10, windowMs: MINUTE },
    professional: { limit: 10, windowMs: MINUTE },
    enterprise: { limit: 10, windowMs: MINUTE },
  },

  /**
   * AI-powered endpoints — expensive compute, tight limits.
   */
  ai: {
    default: { limit: 5, windowMs: MINUTE },
    free: { limit: 5, windowMs: HOUR },
    starter: { limit: 20, windowMs: HOUR },
    professional: { limit: 100, windowMs: HOUR },
    enterprise: { limit: 500, windowMs: HOUR },
  },

  /**
   * Mutation endpoints — creating/updating pedimentos, operations, etc.
   */
  mutation: {
    default: { limit: 30, windowMs: MINUTE },
    free: { limit: 30, windowMs: MINUTE },
    starter: { limit: 60, windowMs: MINUTE },
    professional: { limit: 120, windowMs: MINUTE },
    enterprise: { limit: 300, windowMs: MINUTE },
  },

  /**
   * Export/import endpoints — heavy I/O operations.
   */
  export: {
    default: { limit: 5, windowMs: MINUTE },
    free: { limit: 5, windowMs: HOUR },
    starter: { limit: 20, windowMs: HOUR },
    professional: { limit: 50, windowMs: HOUR },
    enterprise: { limit: 200, windowMs: HOUR },
  },

  /**
   * General read endpoints — lists, detail views, dashboards.
   */
  read: {
    default: { limit: 120, windowMs: MINUTE },
    free: { limit: 120, windowMs: MINUTE },
    starter: { limit: 240, windowMs: MINUTE },
    professional: { limit: 480, windowMs: MINUTE },
    enterprise: { limit: 1000, windowMs: MINUTE },
  },

  /**
   * Search/lookup endpoints — TIGIE, Anexo 22 catalogs.
   */
  search: {
    default: { limit: 60, windowMs: MINUTE },
    free: { limit: 60, windowMs: MINUTE },
    starter: { limit: 120, windowMs: MINUTE },
    professional: { limit: 300, windowMs: MINUTE },
    enterprise: { limit: 600, windowMs: MINUTE },
  },
};

/**
 * IP-level rate limits — applied before authentication.
 * These protect against unauthenticated abuse (bots, DDoS, scanners).
 */
export const IP_RATE_LIMITS = {
  global: { limit: 300, windowMs: MINUTE },
  auth: { limit: 15, windowMs: MINUTE },
} as const;

/**
 * Tenant-level rate limits — aggregate across all users in an org.
 * Prevents a single tenant from monopolizing shared infrastructure.
 */
export const TENANT_RATE_LIMITS: Record<PlanKey, PlanLimits> = {
  default: { limit: 500, windowMs: MINUTE },
  free: { limit: 500, windowMs: MINUTE },
  starter: { limit: 2000, windowMs: MINUTE },
  professional: { limit: 5000, windowMs: MINUTE },
  enterprise: { limit: 15000, windowMs: MINUTE },
};
