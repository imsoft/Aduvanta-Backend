import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipientUserId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}
