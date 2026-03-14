import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { documentRequirements } from '../../database/schema/index.js';

export type DocumentRequirementRecord = typeof documentRequirements.$inferSelect;
export type NewDocumentRequirement = typeof documentRequirements.$inferInsert;

@Injectable()
export class ComplianceDocumentRequirementsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(
    entry: NewDocumentRequirement,
  ): Promise<DocumentRequirementRecord> {
    const [record] = await this.db
      .insert(documentRequirements)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<DocumentRequirementRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentRequirements)
      .where(eq(documentRequirements.id, id))
      .limit(1);
    return result[0];
  }

  async findByRuleSet(
    ruleSetId: string,
    organizationId: string,
  ): Promise<DocumentRequirementRecord[]> {
    return this.db
      .select()
      .from(documentRequirements)
      .where(
        and(
          eq(documentRequirements.ruleSetId, ruleSetId),
          eq(documentRequirements.organizationId, organizationId),
        ),
      );
  }

  async findByRuleSetAndCategory(
    ruleSetId: string,
    documentCategoryId: string,
  ): Promise<DocumentRequirementRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentRequirements)
      .where(
        and(
          eq(documentRequirements.ruleSetId, ruleSetId),
          eq(documentRequirements.documentCategoryId, documentCategoryId),
        ),
      )
      .limit(1);
    return result[0];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewDocumentRequirement>,
  ): Promise<DocumentRequirementRecord | undefined> {
    const result = await this.db
      .update(documentRequirements)
      .set(data)
      .where(
        and(
          eq(documentRequirements.id, id),
          eq(documentRequirements.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(documentRequirements)
      .where(
        and(
          eq(documentRequirements.id, id),
          eq(documentRequirements.organizationId, organizationId),
        ),
      );
  }
}
