import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString()
  notificationType: string;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  webhookEnabled?: boolean;
}
