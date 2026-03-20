import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { documentCategories, documents } from '../../database/schema/index.js';

export type DocumentCategoryRecord = typeof documentCategories.$inferSelect;
export type NewDocumentCategory = typeof documentCategories.$inferInsert;

@Injectable()
export class DocumentCategoriesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewDocumentCategory): Promise<DocumentCategoryRecord> {
    const [record] = await this.db
      .insert(documentCategories)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<DocumentCategoryRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentCategories)
      .where(eq(documentCategories.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<DocumentCategoryRecord[]> {
    return this.db
      .select()
      .from(documentCategories)
      .where(eq(documentCategories.organizationId, organizationId));
  }

  async findByCodeAndOrg(
    code: string,
    organizationId: string,
  ): Promise<DocumentCategoryRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.code, code),
          eq(documentCategories.organizationId, organizationId),
        ),
      )
      .limit(1);
    return result[0];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewDocumentCategory>,
  ): Promise<DocumentCategoryRecord | undefined> {
    const result = await this.db
      .update(documentCategories)
      .set(data)
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(documentCategories)
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.organizationId, organizationId),
        ),
      );
  }

  async hasDocumentsWithCategory(
    categoryId: string,
    organizationId: string,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.categoryId, categoryId),
          eq(documents.organizationId, organizationId),
        ),
      )
      .limit(1);
    return result.length > 0;
  }
}
