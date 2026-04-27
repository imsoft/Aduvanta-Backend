import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, and, or, isNull, gte } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { billingOverrides } from '../../database/schema/billing-overrides.schema.js';
import { organizations } from '../../database/schema/organizations.schema.js';

export type BillingOverride = typeof billingOverrides.$inferSelect;

export type BillingOverrideWithOrg = BillingOverride & {
  organizationName: string;
  organizationSlug: string;
};

@Injectable()
export class BillingOverridesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(): Promise<BillingOverrideWithOrg[]> {
    const rows = await this.db
      .select({
        id: billingOverrides.id,
        organizationId: billingOverrides.organizationId,
        discountPercent: billingOverrides.discountPercent,
        isFree: billingOverrides.isFree,
        note: billingOverrides.note,
        validUntil: billingOverrides.validUntil,
        createdById: billingOverrides.createdById,
        createdAt: billingOverrides.createdAt,
        updatedAt: billingOverrides.updatedAt,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
      })
      .from(billingOverrides)
      .innerJoin(organizations, eq(billingOverrides.organizationId, organizations.id))
      .orderBy(desc(billingOverrides.createdAt));

    return rows;
  }

  async findActive(): Promise<BillingOverrideWithOrg[]> {
    const now = new Date();
    const rows = await this.db
      .select({
        id: billingOverrides.id,
        organizationId: billingOverrides.organizationId,
        discountPercent: billingOverrides.discountPercent,
        isFree: billingOverrides.isFree,
        note: billingOverrides.note,
        validUntil: billingOverrides.validUntil,
        createdById: billingOverrides.createdById,
        createdAt: billingOverrides.createdAt,
        updatedAt: billingOverrides.updatedAt,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
      })
      .from(billingOverrides)
      .innerJoin(organizations, eq(billingOverrides.organizationId, organizations.id))
      .where(or(isNull(billingOverrides.validUntil), gte(billingOverrides.validUntil, now)))
      .orderBy(desc(billingOverrides.createdAt));

    return rows;
  }

  async findByOrganization(organizationId: string): Promise<BillingOverride | undefined> {
    const rows = await this.db
      .select()
      .from(billingOverrides)
      .where(eq(billingOverrides.organizationId, organizationId))
      .limit(1);

    return rows[0];
  }

  async create(data: {
    organizationId: string;
    discountPercent: number;
    isFree: boolean;
    note?: string;
    validUntil?: Date;
    createdById: string;
  }): Promise<BillingOverride> {
    const rows = await this.db
      .insert(billingOverrides)
      .values({
        organizationId: data.organizationId,
        discountPercent: data.discountPercent,
        isFree: data.isFree,
        note: data.note,
        validUntil: data.validUntil,
        createdById: data.createdById,
      })
      .returning();

    return rows[0];
  }

  async update(
    id: string,
    data: {
      discountPercent?: number;
      isFree?: boolean;
      note?: string;
      validUntil?: Date | null;
    },
  ): Promise<BillingOverride> {
    const rows = await this.db
      .update(billingOverrides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(billingOverrides.id, id))
      .returning();

    return rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(billingOverrides).where(eq(billingOverrides.id, id));
  }
}
