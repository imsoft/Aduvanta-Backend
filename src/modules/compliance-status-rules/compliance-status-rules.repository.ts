import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { statusTransitionRules, type OperationStatus } from '../../database/schema/index.js';

export type StatusTransitionRuleRecord = typeof statusTransitionRules.$inferSelect;
export type NewStatusTransitionRule = typeof statusTransitionRules.$inferInsert;

@Injectable()
export class ComplianceStatusRulesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewStatusTransitionRule): Promise<StatusTransitionRuleRecord> {
    const [record] = await this.db
      .insert(statusTransitionRules)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<StatusTransitionRuleRecord | undefined> {
    const result = await this.db
      .select()
      .from(statusTransitionRules)
      .where(eq(statusTransitionRules.id, id))
      .limit(1);
    return result[0];
  }

  async findByRuleSet(
    ruleSetId: string,
    organizationId: string,
  ): Promise<StatusTransitionRuleRecord[]> {
    return this.db
      .select()
      .from(statusTransitionRules)
      .where(
        and(
          eq(statusTransitionRules.ruleSetId, ruleSetId),
          eq(statusTransitionRules.organizationId, organizationId),
        ),
      )
      .orderBy(statusTransitionRules.fromStatus);
  }

  async findByRuleSetAndTransition(
    ruleSetId: string,
    fromStatus: OperationStatus,
    toStatus: OperationStatus,
  ): Promise<StatusTransitionRuleRecord | undefined> {
    const result = await this.db
      .select()
      .from(statusTransitionRules)
      .where(
        and(
          eq(statusTransitionRules.ruleSetId, ruleSetId),
          eq(statusTransitionRules.fromStatus, fromStatus),
          eq(statusTransitionRules.toStatus, toStatus),
        ),
      )
      .limit(1);
    return result[0];
  }

  async findByRuleSetAndFromStatus(
    ruleSetId: string,
    fromStatus: OperationStatus,
  ): Promise<StatusTransitionRuleRecord[]> {
    return this.db
      .select()
      .from(statusTransitionRules)
      .where(
        and(
          eq(statusTransitionRules.ruleSetId, ruleSetId),
          eq(statusTransitionRules.fromStatus, fromStatus),
        ),
      );
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewStatusTransitionRule>,
  ): Promise<StatusTransitionRuleRecord | undefined> {
    const result = await this.db
      .update(statusTransitionRules)
      .set(data)
      .where(
        and(
          eq(statusTransitionRules.id, id),
          eq(statusTransitionRules.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(statusTransitionRules)
      .where(
        and(
          eq(statusTransitionRules.id, id),
          eq(statusTransitionRules.organizationId, organizationId),
        ),
      );
  }
}
