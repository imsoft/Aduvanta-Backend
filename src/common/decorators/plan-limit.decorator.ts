import { SetMetadata } from '@nestjs/common';

export const PLAN_LIMIT_KEY = 'plan_limit_resource';

export type PlanLimitResource =
  | 'users'
  | 'clients'
  | 'operations'
  | 'integrations';

/**
 * Marks an endpoint as requiring a plan limit check.
 *
 * Usage:
 *   @PlanLimit('operations')
 *   @Post()
 *   async create() { ... }
 *
 * The PlanEnforcementGuard reads this metadata and compares
 * current usage against the organization's plan limit for the resource.
 */
export function PlanLimit(resource: PlanLimitResource) {
  return SetMetadata(PLAN_LIMIT_KEY, resource);
}
