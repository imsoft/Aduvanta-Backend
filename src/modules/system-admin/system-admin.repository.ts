import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, desc, count } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { systemAdmins } from '../../database/schema/system-admins.schema.js';
import { organizations } from '../../database/schema/organizations.schema.js';
import { memberships } from '../../database/schema/memberships.schema.js';
import { operations } from '../../database/schema/operations.schema.js';
import { customsEntries } from '../../database/schema/customs-entries.schema.js';
import { auditLogs } from '../../database/schema/audit-logs.schema.js';

@Injectable()
export class SystemAdminRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async isSystemAdmin(userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: systemAdmins.id })
      .from(systemAdmins)
      .where(eq(systemAdmins.userId, userId))
      .limit(1);

    return rows.length > 0;
  }

  async getPlatformOverview() {
    const [
      orgsResult,
      usersResult,
      operationsResult,
      entriesResult,
      recentAuditResult,
    ] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)::int` }).from(organizations),

      this.db.select({ count: sql<number>`count(*)::int` }).from(memberships),

      this.db
        .select({
          total: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where status not in ('COMPLETED','CANCELLED','ARCHIVED'))::int`,
        })
        .from(operations),

      this.db
        .select({
          total: sql<number>`count(*)::int`,
          thisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', now()))::int`,
        })
        .from(customsEntries),

      this.db
        .select({
          action: auditLogs.action,
          resource: auditLogs.resource,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(10),
    ]);

    return {
      totalOrganizations: orgsResult[0]?.count ?? 0,
      totalUsers: usersResult[0]?.count ?? 0,
      totalOperations: operationsResult[0]?.total ?? 0,
      activeOperations: operationsResult[0]?.active ?? 0,
      totalEntries: entriesResult[0]?.total ?? 0,
      entriesThisMonth: entriesResult[0]?.thisMonth ?? 0,
      recentActivity: recentAuditResult,
    };
  }

  async listAllOrganizations(limit: number, offset: number) {
    const [rows, countResult] = await Promise.all([
      this.db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          createdAt: organizations.createdAt,
          memberCount: sql<number>`(
            select count(*)::int from memberships m where m.organization_id = organizations.id
          )`,
          operationCount: sql<number>`(
            select count(*)::int from operations o where o.organization_id = organizations.id
          )`,
          entryCount: sql<number>`(
            select count(*)::int from customs_entries ce where ce.organization_id = organizations.id
          )`,
        })
        .from(organizations)
        .orderBy(desc(organizations.createdAt))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(organizations),
    ]);

    return { organizations: rows, total: countResult[0]?.count ?? 0 };
  }

  async listAllUsers(limit: number, offset: number, search?: string) {
    // Query the Better Auth "user" table directly
    const searchClause = search
      ? sql`where u.name ilike ${'%' + search + '%'} or u.email ilike ${'%' + search + '%'}`
      : sql``;

    const [rows, countResult] = await Promise.all([
      this.db.execute(sql`
        select
          u.id,
          u.name,
          u.email,
          u.email_verified as "emailVerified",
          u.created_at as "createdAt",
          (select count(*)::int from memberships m where m.user_id = u.id) as "orgCount",
          exists(select 1 from system_admins sa where sa.user_id = u.id) as "isSystemAdmin"
        from "user" u
        ${searchClause}
        order by u.created_at desc
        limit ${limit} offset ${offset}
      `),
      this.db.execute(sql`
        select count(*)::int as count from "user" u ${searchClause}
      `),
    ]);

    return {
      users: rows.rows as {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        orgCount: number;
        isSystemAdmin: boolean;
      }[],
      total: (countResult.rows[0] as { count: number })?.count ?? 0,
    };
  }

  async addSystemAdmin(userId: string): Promise<void> {
    await this.db
      .insert(systemAdmins)
      .values({ userId })
      .onConflictDoNothing();
  }

  async removeSystemAdmin(userId: string): Promise<void> {
    await this.db
      .delete(systemAdmins)
      .where(eq(systemAdmins.userId, userId));
  }
}
