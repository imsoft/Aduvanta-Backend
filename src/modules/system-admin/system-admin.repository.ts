import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, desc, ilike, or, isNull, and, gte, lte } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { systemAdmins } from '../../database/schema/system-admins.schema.js';
import { organizations } from '../../database/schema/organizations.schema.js';
import { memberships } from '../../database/schema/memberships.schema.js';
import { operations } from '../../database/schema/operations.schema.js';
import { customsEntries } from '../../database/schema/customs-entries.schema.js';
import { auditLogs } from '../../database/schema/audit-logs.schema.js';
import { featureFlags } from '../../database/schema/feature-flags.schema.js';
import { sessions } from '../../database/schema/auth.schema.js';
import { organizationSubscriptions } from '../../database/schema/organization-subscriptions.schema.js';
import { plans } from '../../database/schema/plans.schema.js';
import { systemAnnouncements } from '../../database/schema/system-announcements.schema.js';

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

  async getUsageByOrganization(limit: number, offset: number) {
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
          entryCount: sql<number>`(
            select count(*)::int from customs_entries ce where ce.organization_id = organizations.id
          )`,
          operationCount: sql<number>`(
            select count(*)::int from operations o where o.organization_id = organizations.id
          )`,
          entriesThisMonth: sql<number>`(
            select count(*)::int from customs_entries ce
            where ce.organization_id = organizations.id
              and ce.created_at >= date_trunc('month', now())
          )`,
          subscriptionStatus: sql<string>`(
            select os.status from organization_subscriptions os
            where os.organization_id = organizations.id
            limit 1
          )`,
          planName: sql<string>`(
            select p.name from organization_subscriptions os
            join plans p on p.id = os.plan_id
            where os.organization_id = organizations.id
            limit 1
          )`,
        })
        .from(organizations)
        .orderBy(desc(organizations.createdAt))
        .limit(limit)
        .offset(offset),

      this.db.select({ count: sql<number>`count(*)::int` }).from(organizations),
    ]);

    return { usage: rows, total: countResult[0]?.count ?? 0 };
  }

  async listActiveSessions(limit: number, offset: number) {
    const [rows, countResult] = await Promise.all([
      this.db.execute(sql`
        select
          s.id,
          s.user_id as "userId",
          u.name as "userName",
          u.email as "userEmail",
          s.ip_address as "ipAddress",
          s.user_agent as "userAgent",
          s.created_at as "createdAt",
          s.expires_at as "expiresAt",
          exists(select 1 from system_admins sa where sa.user_id = s.user_id) as "isSystemAdmin"
        from session s
        join "user" u on u.id = s.user_id
        where s.expires_at > now()
        order by s.created_at desc
        limit ${limit} offset ${offset}
      `),
      this.db.execute(sql`
        select count(*)::int as count
        from session s
        where s.expires_at > now()
      `),
    ]);

    return {
      sessions: rows.rows as {
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        expiresAt: Date;
        isSystemAdmin: boolean;
      }[],
      total: (countResult.rows[0] as { count: number })?.count ?? 0,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async getBillingSummary() {
    const [
      subsResult,
      planStatsResult,
      statusStatsResult,
    ] = await Promise.all([
      this.db
        .select({
          id: organizationSubscriptions.id,
          organizationId: organizationSubscriptions.organizationId,
          status: organizationSubscriptions.status,
          billingInterval: organizationSubscriptions.billingInterval,
          currentPeriodEnd: organizationSubscriptions.currentPeriodEnd,
          trialEndsAt: organizationSubscriptions.trialEndsAt,
          cancelAtPeriodEnd: organizationSubscriptions.cancelAtPeriodEnd,
          createdAt: organizationSubscriptions.createdAt,
          organizationName: sql<string>`(
            select name from organizations o where o.id = organization_subscriptions.organization_id
          )`,
          organizationSlug: sql<string>`(
            select slug from organizations o where o.id = organization_subscriptions.organization_id
          )`,
          planName: plans.name,
          planCode: plans.code,
          priceMonthly: plans.priceMonthly,
          priceYearly: plans.priceYearly,
        })
        .from(organizationSubscriptions)
        .leftJoin(plans, eq(plans.id, organizationSubscriptions.planId))
        .orderBy(desc(organizationSubscriptions.createdAt))
        .limit(100),

      this.db
        .select({
          planName: plans.name,
          planCode: plans.code,
          count: sql<number>`count(*)::int`,
        })
        .from(organizationSubscriptions)
        .leftJoin(plans, eq(plans.id, organizationSubscriptions.planId))
        .where(eq(organizationSubscriptions.status, 'ACTIVE'))
        .groupBy(plans.name, plans.code),

      this.db
        .select({
          status: organizationSubscriptions.status,
          count: sql<number>`count(*)::int`,
        })
        .from(organizationSubscriptions)
        .groupBy(organizationSubscriptions.status),
    ]);

    return {
      subscriptions: subsResult,
      byPlan: planStatsResult,
      byStatus: statusStatsResult,
    };
  }

  async listAnnouncements() {
    return this.db
      .select()
      .from(systemAnnouncements)
      .orderBy(desc(systemAnnouncements.createdAt));
  }

  async listActiveAnnouncements() {
    const now = new Date();
    return this.db
      .select()
      .from(systemAnnouncements)
      .where(
        and(
          eq(systemAnnouncements.isActive, true),
          lte(systemAnnouncements.startsAt, now),
          or(
            isNull(systemAnnouncements.endsAt),
            gte(systemAnnouncements.endsAt, now),
          ),
        ),
      )
      .orderBy(desc(systemAnnouncements.createdAt));
  }

  async createAnnouncement(data: {
    title: string;
    body: string;
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    startsAt: Date;
    endsAt?: Date;
    createdById: string;
  }) {
    const [row] = await this.db
      .insert(systemAnnouncements)
      .values({
        title: data.title,
        body: data.body,
        level: data.level,
        startsAt: data.startsAt,
        endsAt: data.endsAt ?? null,
        createdById: data.createdById,
      })
      .returning();
    return row;
  }

  async updateAnnouncement(
    id: string,
    data: Partial<{
      title: string;
      body: string;
      level: 'INFO' | 'WARNING' | 'CRITICAL';
      isActive: boolean;
      startsAt: Date;
      endsAt: Date | null;
    }>,
  ) {
    const [row] = await this.db
      .update(systemAnnouncements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(systemAnnouncements.id, id))
      .returning();
    return row;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.db.delete(systemAnnouncements).where(eq(systemAnnouncements.id, id));
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
