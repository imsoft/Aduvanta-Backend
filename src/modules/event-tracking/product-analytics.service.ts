import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  eq,
  and,
  gte,
  lte,
  sql,
  desc,
  count,
  countDistinct,
} from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  productEvents,
  organizationSubscriptions,
  plans,
} from '../../database/schema/index.js';
import { SubscriptionsRepository } from '../subscriptions/subscriptions.repository.js';

export interface DailyActiveUsersRow {
  date: string;
  count: number;
}

export interface MonthlyActiveUsersRow {
  month: string;
  count: number;
}

export interface RetentionResult {
  cohortSize: number;
  retention: Array<{
    monthOffset: number;
    activeUsers: number;
    rate: number;
  }>;
}

export interface FeatureAdoptionRow {
  eventName: string;
  uniqueUsers: number;
  totalEvents: number;
}

export interface FunnelStepRow {
  step: string;
  users: number;
  dropoffRate: number;
}

export interface SaasMetrics {
  mrr: number;
  totalSubscribers: number;
  churnCount: number;
  newSubscribers: number;
  churnRate: number;
}

export interface EventCountRow {
  eventName: string;
  count: number;
}

@Injectable()
export class ProductAnalyticsService {
  private readonly logger = new Logger(ProductAnalyticsService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async getDailyActiveUsers(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyActiveUsersRow[]> {
    try {
      const rows = await this.db
        .select({
          date: sql<string>`DATE(${productEvents.occurredAt})`.as('date'),
          count: countDistinct(productEvents.userId).as('count'),
        })
        .from(productEvents)
        .where(
          and(
            eq(productEvents.organizationId, organizationId),
            gte(productEvents.occurredAt, startDate),
            lte(productEvents.occurredAt, endDate),
          ),
        )
        .groupBy(sql`DATE(${productEvents.occurredAt})`)
        .orderBy(sql`DATE(${productEvents.occurredAt})`);

      return rows.map((row) => ({
        date: String(row.date),
        count: Number(row.count),
      }));
    } catch (error) {
      this.logger.error(
        { error, organizationId, startDate, endDate },
        'Failed to query daily active users',
      );
      throw error;
    }
  }

  async getMonthlyActiveUsers(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MonthlyActiveUsersRow[]> {
    try {
      const rows = await this.db
        .select({
          month:
            sql<string>`DATE_TRUNC('month', ${productEvents.occurredAt})`.as(
              'month',
            ),
          count: countDistinct(productEvents.userId).as('count'),
        })
        .from(productEvents)
        .where(
          and(
            eq(productEvents.organizationId, organizationId),
            gte(productEvents.occurredAt, startDate),
            lte(productEvents.occurredAt, endDate),
          ),
        )
        .groupBy(sql`DATE_TRUNC('month', ${productEvents.occurredAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${productEvents.occurredAt})`);

      return rows.map((row) => ({
        month: String(row.month),
        count: Number(row.count),
      }));
    } catch (error) {
      this.logger.error(
        { error, organizationId, startDate, endDate },
        'Failed to query monthly active users',
      );
      throw error;
    }
  }

  async getRetention(
    organizationId: string,
    cohortMonth: Date,
  ): Promise<RetentionResult> {
    try {
      const result = await this.db.execute<{
        month_offset: number;
        active_users: number;
      }>(sql`
        WITH cohort AS (
          SELECT DISTINCT user_id, DATE_TRUNC('month', MIN(occurred_at)) as cohort_month
          FROM product_events
          WHERE organization_id = ${organizationId}
          GROUP BY user_id
          HAVING DATE_TRUNC('month', MIN(occurred_at)) = DATE_TRUNC('month', ${cohortMonth}::timestamptz)
        ),
        activity AS (
          SELECT DISTINCT pe.user_id, DATE_TRUNC('month', pe.occurred_at) as activity_month
          FROM product_events pe
          INNER JOIN cohort c ON pe.user_id = c.user_id
          WHERE pe.organization_id = ${organizationId}
        )
        SELECT
          EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month))::int as month_offset,
          COUNT(DISTINCT a.user_id)::int as active_users
        FROM cohort c
        LEFT JOIN activity a ON c.user_id = a.user_id
        GROUP BY month_offset
        ORDER BY month_offset
      `);

      const rows = result.rows;

      const cohortRow = rows.find((r) => r.month_offset === 0);
      const cohortSize = cohortRow ? Number(cohortRow.active_users) : 0;

      const retention = rows
        .filter((r) => r.month_offset !== null && r.month_offset <= 6)
        .map((r) => ({
          monthOffset: Number(r.month_offset),
          activeUsers: Number(r.active_users),
          rate: cohortSize > 0 ? Number(r.active_users) / cohortSize : 0,
        }));

      return { cohortSize, retention };
    } catch (error) {
      this.logger.error(
        { error, organizationId, cohortMonth },
        'Failed to query retention data',
      );
      throw error;
    }
  }

  async getFeatureAdoption(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FeatureAdoptionRow[]> {
    try {
      const rows = await this.db
        .select({
          eventName: productEvents.eventName,
          uniqueUsers: countDistinct(productEvents.userId).as('unique_users'),
          totalEvents: count().as('total_events'),
        })
        .from(productEvents)
        .where(
          and(
            eq(productEvents.organizationId, organizationId),
            eq(productEvents.category, 'product'),
            gte(productEvents.occurredAt, startDate),
            lte(productEvents.occurredAt, endDate),
          ),
        )
        .groupBy(productEvents.eventName)
        .orderBy(desc(countDistinct(productEvents.userId)));

      return rows.map((row) => ({
        eventName: row.eventName,
        uniqueUsers: Number(row.uniqueUsers),
        totalEvents: Number(row.totalEvents),
      }));
    } catch (error) {
      this.logger.error(
        { error, organizationId, startDate, endDate },
        'Failed to query feature adoption',
      );
      throw error;
    }
  }

  async getFunnelAnalysis(
    organizationId: string,
    steps: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<FunnelStepRow[]> {
    try {
      if (steps.length === 0) {
        return [];
      }

      const stepCounts: Array<{ step: string; users: number }> = [];

      for (const step of steps) {
        const [result] = await this.db
          .select({
            users: countDistinct(productEvents.userId).as('users'),
          })
          .from(productEvents)
          .where(
            and(
              eq(productEvents.organizationId, organizationId),
              eq(productEvents.eventName, step),
              gte(productEvents.occurredAt, startDate),
              lte(productEvents.occurredAt, endDate),
            ),
          );

        stepCounts.push({
          step,
          users: Number(result.users),
        });
      }

      return stepCounts.map((current, index) => {
        const previousUsers =
          index === 0 ? current.users : stepCounts[index - 1].users;
        const dropoffRate =
          previousUsers > 0 ? 1 - current.users / previousUsers : 0;

        return {
          step: current.step,
          users: current.users,
          dropoffRate: Math.round(dropoffRate * 10000) / 10000,
        };
      });
    } catch (error) {
      this.logger.error(
        { error, organizationId, steps, startDate, endDate },
        'Failed to query funnel analysis',
      );
      throw error;
    }
  }

  async getSaasMetrics(startDate: Date, endDate: Date): Promise<SaasMetrics> {
    try {
      // MRR: sum of active/trialing subscriptions × plan monthly price
      const mrrResult = await this.db.execute<{ mrr: string }>(sql`
        SELECT COALESCE(SUM(
          CASE
            WHEN os.billing_interval = 'year' AND p.price_yearly IS NOT NULL
              THEN p.price_yearly::numeric / 12
            ELSE COALESCE(p.price_monthly::numeric, 0)
          END
        ), 0)::text as mrr
        FROM organization_subscriptions os
        INNER JOIN plans p ON os.plan_id = p.id
        WHERE os.status IN ('ACTIVE', 'TRIALING')
      `);

      const mrr = Number(mrrResult.rows[0]?.mrr ?? 0);

      // Total active subscribers
      const [subscriberResult] = await this.db
        .select({
          total: count().as('total'),
        })
        .from(organizationSubscriptions)
        .where(
          sql`${organizationSubscriptions.status} IN ('ACTIVE', 'TRIALING')`,
        );

      const totalSubscribers = Number(subscriberResult.total);

      // Churn: cancelled subscriptions with ends_at in range
      const [churnResult] = await this.db
        .select({
          total: count().as('total'),
        })
        .from(organizationSubscriptions)
        .where(
          and(
            eq(organizationSubscriptions.status, 'CANCELLED'),
            gte(organizationSubscriptions.endsAt, startDate),
            lte(organizationSubscriptions.endsAt, endDate),
          ),
        );

      const churnCount = Number(churnResult.total);

      // New subscribers in range
      const [newSubResult] = await this.db
        .select({
          total: count().as('total'),
        })
        .from(organizationSubscriptions)
        .where(
          and(
            gte(organizationSubscriptions.startedAt, startDate),
            lte(organizationSubscriptions.startedAt, endDate),
          ),
        );

      const newSubscribers = Number(newSubResult.total);

      const churnDenominator = totalSubscribers + churnCount;
      const churnRate =
        churnDenominator > 0 ? churnCount / churnDenominator : 0;

      return {
        mrr,
        totalSubscribers,
        churnCount,
        newSubscribers,
        churnRate: Math.round(churnRate * 10000) / 10000,
      };
    } catch (error) {
      this.logger.error(
        { error, startDate, endDate },
        'Failed to query SaaS metrics',
      );
      throw error;
    }
  }

  async getEventCounts(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EventCountRow[]> {
    try {
      const rows = await this.db
        .select({
          eventName: productEvents.eventName,
          count: count().as('count'),
        })
        .from(productEvents)
        .where(
          and(
            eq(productEvents.organizationId, organizationId),
            gte(productEvents.occurredAt, startDate),
            lte(productEvents.occurredAt, endDate),
          ),
        )
        .groupBy(productEvents.eventName)
        .orderBy(desc(count()));

      return rows.map((row) => ({
        eventName: row.eventName,
        count: Number(row.count),
      }));
    } catch (error) {
      this.logger.error(
        { error, organizationId, startDate, endDate },
        'Failed to query event counts',
      );
      throw error;
    }
  }

  async getRecentEvents(
    organizationId: string,
    limit: number,
  ): Promise<(typeof productEvents.$inferSelect)[]> {
    try {
      return await this.db
        .select()
        .from(productEvents)
        .where(eq(productEvents.organizationId, organizationId))
        .orderBy(desc(productEvents.occurredAt))
        .limit(limit);
    } catch (error) {
      this.logger.error(
        { error, organizationId, limit },
        'Failed to query recent events',
      );
      throw error;
    }
  }
}
