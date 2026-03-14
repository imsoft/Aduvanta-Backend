import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, or } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { featureFlags } from '../../database/schema/index.js';

export type FeatureFlagRecord = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;

@Injectable()
export class FeatureFlagsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByOrganization(organizationId: string): Promise<FeatureFlagRecord[]> {
    // Returns org-specific flags + global flags (organizationId IS NULL).
    return this.db
      .select()
      .from(featureFlags)
      .where(
        or(
          eq(featureFlags.organizationId, organizationId),
          isNull(featureFlags.organizationId),
        ),
      );
  }

  async findById(id: string): Promise<FeatureFlagRecord | undefined> {
    const result = await this.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, id))
      .limit(1);
    return result[0];
  }

  async insert(entry: NewFeatureFlag): Promise<FeatureFlagRecord> {
    const [record] = await this.db
      .insert(featureFlags)
      .values(entry)
      .returning();
    return record;
  }

  async update(
    id: string,
    data: Partial<Pick<FeatureFlagRecord, 'isEnabled' | 'description'>>,
  ): Promise<FeatureFlagRecord | undefined> {
    const [record] = await this.db
      .update(featureFlags)
      .set(data)
      .where(eq(featureFlags.id, id))
      .returning();
    return record;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(featureFlags).where(eq(featureFlags.id, id));
  }

  async findByKeyAndOrg(
    key: string,
    organizationId: string,
  ): Promise<FeatureFlagRecord | undefined> {
    const result = await this.db
      .select()
      .from(featureFlags)
      .where(
        and(
          eq(featureFlags.key, key),
          eq(featureFlags.organizationId, organizationId),
        ),
      )
      .limit(1);
    return result[0];
  }
}
