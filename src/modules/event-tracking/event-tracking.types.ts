export interface TrackEventInput {
  eventId: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  category: EventCategory;
  eventName: string;
  properties?: Record<string, unknown>;
  source: 'client' | 'server';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  pageUrl?: string;
  numericValue?: number;
  occurredAt: Date;
}

export type EventCategory =
  | 'auth'
  | 'onboarding'
  | 'product'
  | 'engagement'
  | 'monetization';

export interface TrackEventClientPayload {
  eventId: string;
  sessionId?: string;
  category: EventCategory;
  eventName: string;
  properties?: Record<string, unknown>;
  pageUrl?: string;
  referrer?: string;
  numericValue?: number;
  occurredAt: string;
}
