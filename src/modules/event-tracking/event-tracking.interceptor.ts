import { randomUUID } from 'node:crypto';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { EventTrackingService } from './event-tracking.service.js';
import type { EventCategory, TrackEventInput } from './event-tracking.types.js';

interface RequestWithSession {
  method: string;
  url: string;
  route?: { path: string };
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  session?: { user: { id: string } };
}

interface RouteEventMapping {
  category: EventCategory;
  eventName: string;
}

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const ROUTE_EVENT_MAP = new Map<string, RouteEventMapping>([
  [
    'POST /api/auth/sign-up',
    { category: 'auth', eventName: 'user.registered' },
  ],
  ['POST /api/auth/sign-in', { category: 'auth', eventName: 'user.logged_in' }],
  [
    'POST /api/organizations',
    { category: 'product', eventName: 'organization.created' },
  ],
  [
    'POST /api/operations',
    { category: 'product', eventName: 'operation.created' },
  ],
  [
    'PATCH /api/operations/:id',
    { category: 'product', eventName: 'operation.updated' },
  ],
  [
    'POST /api/customs-entries',
    { category: 'product', eventName: 'pedimento.created' },
  ],
  [
    'PATCH /api/customs-entries/:id',
    { category: 'product', eventName: 'pedimento.edited' },
  ],
  [
    'POST /api/documents',
    { category: 'product', eventName: 'document.uploaded' },
  ],
  [
    'POST /api/subscriptions/checkout',
    { category: 'monetization', eventName: 'subscription.checkout_started' },
  ],
  [
    'POST /api/subscriptions/change-plan',
    { category: 'monetization', eventName: 'subscription.plan_changed' },
  ],
  [
    'POST /api/subscriptions/cancel',
    { category: 'monetization', eventName: 'subscription.cancelled' },
  ],
  ['POST /api/exports', { category: 'product', eventName: 'export.requested' }],
]);

const SKIPPED_METHODS = new Set(['OPTIONS', 'HEAD']);

function normalizeRoutePath(path: string): string {
  return path.replace(UUID_PATTERN, ':id');
}

function extractIp(req: RequestWithSession): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]?.split(',')[0]?.trim();
  }
  return req.ip;
}

function extractUserAgent(req: RequestWithSession): string | undefined {
  const ua = req.headers['user-agent'];
  if (typeof ua === 'string') {
    return ua;
  }
  if (Array.isArray(ua) && ua.length > 0) {
    return ua[0];
  }
  return undefined;
}

function resolveRouteMapping(
  method: string,
  req: RequestWithSession,
): RouteEventMapping | undefined {
  // Prefer the NestJS resolved route path (has :param placeholders)
  const routePath: string | undefined = req.route?.path;
  if (routePath) {
    return ROUTE_EVENT_MAP.get(`${method} ${routePath}`);
  }

  // Fallback: normalize the raw URL by replacing UUIDs with :id
  const urlPath = req.url.split('?')[0];
  if (urlPath) {
    const normalized = normalizeRoutePath(urlPath);
    return ROUTE_EVENT_MAP.get(`${method} ${normalized}`);
  }

  return undefined;
}

@Injectable()
export class EventTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventTrackingInterceptor.name);

  constructor(private readonly eventTrackingService: EventTrackingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const method = req.method;

    if (SKIPPED_METHODS.has(method)) {
      return next.handle();
    }

    const mapping = resolveRouteMapping(method, req);
    if (!mapping) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        try {
          const userId = req.session?.user?.id;
          const organizationId = req.headers['x-organization-id'];
          const ipAddress = extractIp(req);
          const userAgent = extractUserAgent(req);

          const event: TrackEventInput = {
            eventId: randomUUID(),
            userId: userId,
            organizationId:
              typeof organizationId === 'string' ? organizationId : undefined,
            category: mapping.category,
            eventName: mapping.eventName,
            source: 'server',
            ipAddress: ipAddress,
            userAgent: userAgent,
            occurredAt: new Date(),
          };

          void this.eventTrackingService.track(event);
        } catch (error) {
          this.logger.warn(
            { error, eventName: mapping.eventName },
            'Failed to track event from interceptor',
          );
        }
      }),
    );
  }
}
