import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export const VALID_EVENT_TYPES = [
  'operation.created',
  'operation.updated',
  'operation.status_changed',
  'document.created',
  'document.version_uploaded',
  'finance.charge_created',
  'finance.advance_created',
] as const;

export type WebhookEventType = (typeof VALID_EVENT_TYPES)[number];

export class CreateIntegrationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsIn(['WEBHOOK'])
  provider: 'WEBHOOK';

  @IsUrl()
  targetUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  secret?: string;

  @IsArray()
  @IsString({ each: true })
  @IsIn(VALID_EVENT_TYPES, { each: true })
  eventTypes: WebhookEventType[];
}
