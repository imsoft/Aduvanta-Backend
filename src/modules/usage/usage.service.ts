import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, ne } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  memberships,
  clients,
  operations,
  integrations,
} from '../../database/schema/index.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';

export interface UsageMetrics {
  users: number;
  clients: number;
  operations: number;
  integrations: number;
}

export interface UsageLimits {
  maxUsers: number;
  maxClients: number;
  maxOperations: number;
  maxIntegrations: number;
}

export interface OrganizationUsage {
  metrics: UsageMetrics;
  limits: UsageLimits | null;
  planCode: string | null;
  planName: string | null;
}

@Injectable()
export class UsageService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async getUsage(organizationId: string): Promise<OrganizationUsage> {
    const [usersResult, clientsResult, operationsResult, integrationsResult] =
      await Promise.all([
        this.db
          .select({ value: count() })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              ne(memberships.role, 'CLIENT'),
            ),
          ),
        this.db
          .select({ value: count() })
          .from(clients)
          .where(
            and(
              eq(clients.organizationId, organizationId),
              eq(clients.status, 'ACTIVE'),
            ),
          ),
        this.db
          .select({ value: count() })
          .from(operations)
          .where(
            and(
              eq(operations.organizationId, organizationId),
              ne(operations.status, 'CANCELLED'),
            ),
          ),
        this.db
          .select({ value: count() })
          .from(integrations)
          .where(
            and(
              eq(integrations.organizationId, organizationId),
              eq(integrations.status, 'ACTIVE'),
            ),
          ),
      ]);

    const metrics: UsageMetrics = {
      users: usersResult[0]?.value ?? 0,
      clients: clientsResult[0]?.value ?? 0,
      operations: operationsResult[0]?.value ?? 0,
      integrations: integrationsResult[0]?.value ?? 0,
    };

    const subscription =
      await this.subscriptionsService.getSubscription(organizationId);

    if (!subscription) {
      return { metrics, limits: null, planCode: null, planName: null };
    }

    const limits: UsageLimits = {
      maxUsers: subscription.plan.maxUsers,
      maxClients: subscription.plan.maxClients,
      maxOperations: subscription.plan.maxOperations,
      maxIntegrations: subscription.plan.maxIntegrations,
    };

    return {
      metrics,
      limits,
      planCode: subscription.plan.code,
      planName: subscription.plan.name,
    };
  }
}
