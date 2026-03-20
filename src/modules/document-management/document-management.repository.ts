import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  documentFolders,
  documentTemplates,
  documentChecklists,
  documentChecklistItems,
} from '../../database/schema/index.js';

export type FolderRecord = typeof documentFolders.$inferSelect;
export type TemplateRecord = typeof documentTemplates.$inferSelect;
export type ChecklistRecord = typeof documentChecklists.$inferSelect;
export type ChecklistItemRecord = typeof documentChecklistItems.$inferSelect;

@Injectable()
export class DocumentManagementRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Folders ---

  async findFoldersByOrganization(
    organizationId: string,
    parentFolderId: string | null,
  ): Promise<FolderRecord[]> {
    if (parentFolderId) {
      return this.db
        .select()
        .from(documentFolders)
        .where(
          and(
            eq(documentFolders.organizationId, organizationId),
            eq(documentFolders.parentFolderId, parentFolderId),
          ),
        )
        .orderBy(documentFolders.name);
    }

    return this.db
      .select()
      .from(documentFolders)
      .where(
        and(
          eq(documentFolders.organizationId, organizationId),
          sql`${documentFolders.parentFolderId} IS NULL`,
        ),
      )
      .orderBy(documentFolders.name);
  }

  async findFolderByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<FolderRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentFolders)
      .where(
        and(
          eq(documentFolders.id, id),
          eq(documentFolders.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertFolder(
    data: typeof documentFolders.$inferInsert,
  ): Promise<FolderRecord> {
    const [created] = await this.db
      .insert(documentFolders)
      .values(data)
      .returning();

    return created;
  }

  async updateFolder(
    id: string,
    data: Partial<typeof documentFolders.$inferInsert>,
  ): Promise<FolderRecord> {
    const [updated] = await this.db
      .update(documentFolders)
      .set(data)
      .where(eq(documentFolders.id, id))
      .returning();

    return updated;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.db.delete(documentFolders).where(eq(documentFolders.id, id));
  }

  // --- Templates ---

  async findTemplatesByOrganization(
    organizationId: string,
  ): Promise<TemplateRecord[]> {
    return this.db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.organizationId, organizationId))
      .orderBy(documentTemplates.type, documentTemplates.name);
  }

  async findTemplateByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<TemplateRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.id, id),
          eq(documentTemplates.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertTemplate(
    data: typeof documentTemplates.$inferInsert,
  ): Promise<TemplateRecord> {
    const [created] = await this.db
      .insert(documentTemplates)
      .values(data)
      .returning();

    return created;
  }

  async updateTemplate(
    id: string,
    data: Partial<typeof documentTemplates.$inferInsert>,
  ): Promise<TemplateRecord> {
    const [updated] = await this.db
      .update(documentTemplates)
      .set(data)
      .where(eq(documentTemplates.id, id))
      .returning();

    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.db.delete(documentTemplates).where(eq(documentTemplates.id, id));
  }

  // --- Checklists ---

  async findChecklistsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ checklists: ChecklistRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(documentChecklists)
        .where(eq(documentChecklists.organizationId, organizationId))
        .orderBy(desc(documentChecklists.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(documentChecklists)
        .where(eq(documentChecklists.organizationId, organizationId)),
    ]);

    return { checklists: rows, total: countResult[0].count };
  }

  async findChecklistByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<ChecklistRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentChecklists)
      .where(
        and(
          eq(documentChecklists.id, id),
          eq(documentChecklists.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertChecklist(
    data: typeof documentChecklists.$inferInsert,
  ): Promise<ChecklistRecord> {
    const [created] = await this.db
      .insert(documentChecklists)
      .values(data)
      .returning();

    return created;
  }

  async updateChecklist(
    id: string,
    data: Partial<typeof documentChecklists.$inferInsert>,
  ): Promise<ChecklistRecord> {
    const [updated] = await this.db
      .update(documentChecklists)
      .set(data)
      .where(eq(documentChecklists.id, id))
      .returning();

    return updated;
  }

  async deleteChecklist(id: string): Promise<void> {
    await this.db
      .delete(documentChecklists)
      .where(eq(documentChecklists.id, id));
  }

  // --- Checklist Items ---

  async findItemsByChecklist(
    checklistId: string,
  ): Promise<ChecklistItemRecord[]> {
    return this.db
      .select()
      .from(documentChecklistItems)
      .where(eq(documentChecklistItems.checklistId, checklistId))
      .orderBy(documentChecklistItems.itemNumber);
  }

  async findChecklistItemById(
    id: string,
  ): Promise<ChecklistItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(documentChecklistItems)
      .where(eq(documentChecklistItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertChecklistItem(
    data: typeof documentChecklistItems.$inferInsert,
  ): Promise<ChecklistItemRecord> {
    const [created] = await this.db
      .insert(documentChecklistItems)
      .values(data)
      .returning();

    return created;
  }

  async updateChecklistItem(
    id: string,
    data: Partial<typeof documentChecklistItems.$inferInsert>,
  ): Promise<ChecklistItemRecord> {
    const [updated] = await this.db
      .update(documentChecklistItems)
      .set(data)
      .where(eq(documentChecklistItems.id, id))
      .returning();

    return updated;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    await this.db
      .delete(documentChecklistItems)
      .where(eq(documentChecklistItems.id, id));
  }
}
