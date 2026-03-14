import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  memberships,
  organizations,
  users,
  type MembershipRole,
} from '../../database/schema/index.js';

export type MembershipRecord = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;

export interface MemberWithUser {
  membership: MembershipRecord;
  user: { id: string; name: string; email: string };
}

@Injectable()
export class MembershipsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<MembershipRecord | undefined> {
    const result = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByOrganization(organizationId: string): Promise<MemberWithUser[]> {
    return this.db
      .select({
        membership: memberships,
        user: { id: users.id, name: users.name, email: users.email },
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.organizationId, organizationId));
  }

  async findOrganizationsByUserId(userId: string): Promise<
    Array<{
      membership: MembershipRecord;
      organization: typeof organizations.$inferSelect;
    }>
  > {
    return this.db
      .select({ membership: memberships, organization: organizations })
      .from(memberships)
      .innerJoin(
        organizations,
        eq(memberships.organizationId, organizations.id),
      )
      .where(eq(memberships.userId, userId));
  }

  async insert(entry: NewMembership): Promise<MembershipRecord> {
    const [record] = await this.db
      .insert(memberships)
      .values(entry)
      .returning();

    return record;
  }

  async updateRole(
    organizationId: string,
    userId: string,
    role: MembershipRole,
  ): Promise<MembershipRecord | undefined> {
    const result = await this.db
      .update(memberships)
      .set({ role })
      .where(
        and(
          eq(memberships.organizationId, organizationId),
          eq(memberships.userId, userId),
        ),
      )
      .returning();

    return result[0];
  }

  async deleteByOrgAndUser(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    await this.db
      .delete(memberships)
      .where(
        and(
          eq(memberships.organizationId, organizationId),
          eq(memberships.userId, userId),
        ),
      );
  }
}
