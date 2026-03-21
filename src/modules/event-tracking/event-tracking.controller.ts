import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { EventTrackingService } from './event-tracking.service.js';
import { ProductAnalyticsService } from './product-analytics.service.js';
import { TrackEventDto } from './dto/track-event.dto.js';
import {
  DateRangeDto,
  FunnelQueryDto,
  RetentionQueryDto,
  RecentEventsDto,
} from './dto/analytics-query.dto.js';
import type { TrackEventInput } from './event-tracking.types.js';

@Controller('events')
export class EventTrackingController {
  constructor(
    private readonly trackingService: EventTrackingService,
    private readonly analyticsService: ProductAnalyticsService,
  ) {}

  // --- Event ingestion (authenticated) ---

  @Post('track')
  @UseGuards(AuthGuard)
  async trackEvent(
    @Body() dto: TrackEventDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
    @Req() req: Request,
  ) {
    const event: TrackEventInput = {
      eventId: dto.eventId,
      userId: session.user.id,
      organizationId: organizationId || undefined,
      sessionId: dto.sessionId,
      category: dto.category,
      eventName: dto.eventName,
      properties: dto.properties,
      source: 'client',
      ipAddress: extractIp(req),
      userAgent: req.headers['user-agent'],
      referrer: dto.referrer,
      pageUrl: dto.pageUrl,
      numericValue: dto.numericValue,
      occurredAt: new Date(dto.occurredAt),
    };

    void this.trackingService.track(event);

    return { accepted: true };
  }

  @Post('track/batch')
  @UseGuards(AuthGuard)
  async trackBatch(
    @Body() body: { events: TrackEventDto[] },
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
    @Req() req: Request,
  ) {
    const ip = extractIp(req);
    const ua = req.headers['user-agent'];

    const events: TrackEventInput[] = body.events.map((dto) => ({
      eventId: dto.eventId,
      userId: session.user.id,
      organizationId: organizationId || undefined,
      sessionId: dto.sessionId,
      category: dto.category,
      eventName: dto.eventName,
      properties: dto.properties,
      source: 'client' as const,
      ipAddress: ip,
      userAgent: ua,
      referrer: dto.referrer,
      pageUrl: dto.pageUrl,
      numericValue: dto.numericValue,
      occurredAt: new Date(dto.occurredAt),
    }));

    void this.trackingService.trackMany(events);

    return { accepted: true, count: events.length };
  }

  // --- Analytics queries (RBAC protected) ---

  @Get('analytics/dau')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getDau(
    @Query() dto: DateRangeDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getDailyActiveUsers(
      organizationId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('analytics/mau')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getMau(
    @Query() dto: DateRangeDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getMonthlyActiveUsers(
      organizationId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('analytics/retention')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getRetention(
    @Query() dto: RetentionQueryDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getRetention(
      organizationId,
      new Date(dto.cohortMonth),
    );
  }

  @Get('analytics/feature-adoption')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getFeatureAdoption(
    @Query() dto: DateRangeDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getFeatureAdoption(
      organizationId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Post('analytics/funnel')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getFunnel(
    @Body() dto: FunnelQueryDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getFunnelAnalysis(
      organizationId,
      dto.steps,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('analytics/event-counts')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getEventCounts(
    @Query() dto: DateRangeDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getEventCounts(
      organizationId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('analytics/recent')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getRecentEvents(
    @Query() dto: RecentEventsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.analyticsService.getRecentEvents(
      organizationId,
      dto.limit ?? 50,
    );
  }

  // --- Platform-wide SaaS metrics (admin only) ---

  @Get('analytics/saas-metrics')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission(PERMISSION.ANALYTICS_KPI_READ)
  async getSaasMetrics(@Query() dto: DateRangeDto) {
    return this.analyticsService.getSaasMetrics(
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }
}

function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}
