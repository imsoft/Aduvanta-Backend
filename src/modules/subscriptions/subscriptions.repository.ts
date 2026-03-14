import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  plans,
  organizationSubscriptions,
} from '../../database/schema/index.js';

export type PlanRecord = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type SubscriptionRecord = typeof organizationSubscriptions.$inferSelect;
export type NewSubscription = typeof organizationSubscriptions.$inferInsert;

export interface SubscriptionWithPlan {
  subscription: SubscriptionRecord;
  plan: PlanRecord;
}

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAllPlans(): Promise<PlanRecord[]> {
    return this.db.select().from(plans).where(eq(plans.status, 'ACTIVE'));
  }

  async findPlanById(id: string): Promise<PlanRecord | undefined> {
    const result = await this.db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);
    return result[0];
  }

  async findPlanByCode(code: string): Promise<PlanRecord | undefined> {
    const result = await this.db
      .select()
      .from(plans)
      .where(eq(plans.code, code))
      .limit(1);
    return result[0];
  }

  async insertPlan(entry: NewPlan): Promise<PlanRecord> {
    const [record] = await this.db.insert(plans).values(entry).returning();
    return record;
  }

  async findSubscriptionByOrg(
    organizationId: string,
  ): Promise<SubscriptionWithPlan | undefined> {
    const result = await this.db
      .select({ subscription: organizationSubscriptions, plan: plans })
      .from(organizationSubscriptions)
      .innerJoin(plans, eq(organizationSubscriptions.planId, plans.id))
      .where(eq(organizationSubscriptions.organizationId, organizationId))
      .limit(1);
    return result[0];
  }

  async insertSubscription(entry: NewSubscription): Promise<SubscriptionRecord> {
    const [record] = await this.db
      .insert(organizationSubscriptions)
      .values(entry)
      .returning();
    return record;
  }

  async updateSubscription(
    id: string,
    data: Partial<Pick<SubscriptionRecord, 'planId' | 'status' | 'endsAt'>>,
  ): Promise<SubscriptionRecord | undefined> {
    const [record] = await this.db
      .update(organizationSubscriptions)
      .set(data)
      .where(eq(organizationSubscriptions.id, id))
      .returning();
    return record;
  }
}
