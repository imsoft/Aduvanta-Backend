import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  VALID_EVENT_TYPES,
  type WebhookEventType,
} from './create-integration.dto.js';

export class UpdateIntegrationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  secret?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(VALID_EVENT_TYPES, { each: true })
  eventTypes?: WebhookEventType[];

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
