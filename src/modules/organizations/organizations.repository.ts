import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { organizations } from '../../database/schema/index.js';

export type OrganizationRecord = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

@Injectable()
export class OrganizationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findById(id: string): Promise<OrganizationRecord | undefined> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return result[0];
  }

  async findBySlug(slug: string): Promise<OrganizationRecord | undefined> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    return result[0];
  }
}
