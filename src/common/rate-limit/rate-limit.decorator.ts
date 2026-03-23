import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_CATEGORY_KEY = 'rate_limit_category';

/**
 * Sets the rate limit category for a controller or route handler.
 *
 * Categories map to entries in RATE_LIMITS config.
 * If not set, 'global' is used.
 *
 * Usage:
 *   @RateLimit('ai')
 *   @Post('classify')
 *   async classifyTariff() { ... }
 */
export function RateLimit(category: string) {
  return SetMetadata(RATE_LIMIT_CATEGORY_KEY, category);
}
