import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, desc, ilike, or, isNull } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { systemAdmins } from '../../database/schema/system-admins.schema.js';
import { organizations } from '../../database/schema/organizations.schema.js';
import { memberships } from '../../database/schema/memberships.schema.js';
import { operations } from '../../database/schema/operations.schema.js';
import { customsEntries } from '../../database/schema/customs-entries.schema.js';
import { auditLogs } from '../../database/schema/audit-logs.schema.js';
import { featureFlags } from '../../database/schema/feature-flags.schema.js';

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

  async listAllEntries(limit: number, offset: number, search?: string) {
    const searchFilter = search
      ? or(
          ilike(customsEntries.entryNumber, `%${search}%`),
          ilike(customsEntries.internalReference, `%${search}%`),
          ilike(customsEntries.entryKey, `%${search}%`),
        )
      : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select({
          id: customsEntries.id,
          entryNumber: customsEntries.entryNumber,
          entryKey: customsEntries.entryKey,
          regime: customsEntries.regime,
          status: customsEntries.status,
          grandTotal: customsEntries.grandTotal,
          internalReference: customsEntries.internalReference,
          organizationId: customsEntries.organizationId,
          createdAt: customsEntries.createdAt,
          organizationSlug: sql<string>`(
            select slug from organizations o where o.id = ${customsEntries.organizationId}
          )`,
        })
        .from(customsEntries)
        .where(searchFilter)
        .orderBy(desc(customsEntries.createdAt))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsEntries)
        .where(searchFilter),
    ]);

    return { entries: rows, total: countResult[0]?.count ?? 0 };
  }

  async listAllOperations(limit: number, offset: number) {
    const [rows, countResult] = await Promise.all([
      this.db
        .select({
          id: operations.id,
          reference: operations.reference,
          title: operations.title,
          type: operations.type,
          status: operations.status,
          priority: operations.priority,
          organizationId: operations.organizationId,
          createdAt: operations.createdAt,
          organizationSlug: sql<string>`(
            select slug from organizations o where o.id = ${operations.organizationId}
          )`,
        })
        .from(operations)
        .orderBy(desc(operations.createdAt))
        .limit(limit)
        .offset(offset),

      this.db.select({ count: sql<number>`count(*)::int` }).from(operations),
    ]);

    return { operations: rows, total: countResult[0]?.count ?? 0 };
  }

  async listAllAuditLogs(limit: number, offset: number) {
    const [rows, countResult] = await Promise.all([
      this.db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          resource: auditLogs.resource,
          resourceId: auditLogs.resourceId,
          actorId: auditLogs.actorId,
          organizationId: auditLogs.organizationId,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),

      this.db.select({ count: sql<number>`count(*)::int` }).from(auditLogs),
    ]);

    return { logs: rows, total: countResult[0]?.count ?? 0 };
  }

  async listAllFeatureFlags() {
    return this.db
      .select({
        id: featureFlags.id,
        key: featureFlags.key,
        description: featureFlags.description,
        isEnabled: featureFlags.isEnabled,
        organizationId: featureFlags.organizationId,
        createdAt: featureFlags.createdAt,
        updatedAt: featureFlags.updatedAt,
      })
      .from(featureFlags)
      .orderBy(isNull(featureFlags.organizationId), featureFlags.key);
  }

  async setFeatureFlag(key: string, isEnabled: boolean, organizationId?: string): Promise<void> {
    await this.db
      .insert(featureFlags)
      .values({ key, isEnabled, organizationId: organizationId ?? null })
      .onConflictDoUpdate({
        target: [featureFlags.key, featureFlags.organizationId],
        set: { isEnabled, updatedAt: new Date() },
      });
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
