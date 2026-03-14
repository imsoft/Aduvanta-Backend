import { Inject, Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { ruleSets, type OperationType } from '../../database/schema/index.js';

export type RuleSetRecord = typeof ruleSets.$inferSelect;
export type NewRuleSet = typeof ruleSets.$inferInsert;

export interface ListRuleSetsFilter {
  organizationId: string;
  operationType?: OperationType;
  isActive?: boolean;
}

@Injectable()
export class ComplianceRuleSetsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewRuleSet): Promise<RuleSetRecord> {
    const [record] = await this.db.insert(ruleSets).values(entry).returning();
    return record;
  }

  async findById(id: string): Promise<RuleSetRecord | undefined> {
    const result = await this.db
      .select()
      .from(ruleSets)
      .where(eq(ruleSets.id, id))
      .limit(1);
    return result[0];
  }

  async findByCodeAndOrg(
    code: string,
    organizationId: string,
  ): Promise<RuleSetRecord | undefined> {
    const result = await this.db
      .select()
      .from(ruleSets)
      .where(and(eq(ruleSets.code, code), eq(ruleSets.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async findByOrganization(filter: ListRuleSetsFilter): Promise<RuleSetRecord[]> {
    const conditions: SQL[] = [eq(ruleSets.organizationId, filter.organizationId)];

    if (filter.operationType) {
      conditions.push(eq(ruleSets.operationType, filter.operationType));
    }

    if (filter.isActive !== undefined) {
      conditions.push(eq(ruleSets.isActive, filter.isActive));
    }

    return this.db
      .select()
      .from(ruleSets)
      .where(and(...conditions))
      .orderBy(ruleSets.name);
  }

  async findActiveByOperationType(
    operationType: OperationType,
    organizationId: string,
  ): Promise<RuleSetRecord | undefined> {
    const result = await this.db
      .select()
      .from(ruleSets)
      .where(
        and(
          eq(ruleSets.organizationId, organizationId),
          eq(ruleSets.operationType, operationType),
          eq(ruleSets.isActive, true),
        ),
      )
      .limit(1);
    return result[0];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewRuleSet>,
  ): Promise<RuleSetRecord | undefined> {
    const result = await this.db
      .update(ruleSets)
      .set(data)
      .where(and(eq(ruleSets.id, id), eq(ruleSets.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(ruleSets)
      .where(and(eq(ruleSets.id, id), eq(ruleSets.organizationId, organizationId)));
  }
}
