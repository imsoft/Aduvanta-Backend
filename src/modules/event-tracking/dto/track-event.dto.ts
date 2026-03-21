import { IsString, IsOptional, IsIn, IsObject, IsNumber, IsDateString } from 'class-validator';
import type { EventCategory } from '../event-tracking.types.js';

export class TrackEventDto {
  @IsString()
  eventId: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsIn(['auth', 'onboarding', 'product', 'engagement', 'monetization'])
  category: EventCategory;

  @IsString()
  eventName: string;

  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  pageUrl?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsNumber()
  @IsOptional()
  numericValue?: number;

  @IsDateString()
  occurredAt: string;
}

export class TrackBatchDto {
  events: TrackEventDto[];
}
