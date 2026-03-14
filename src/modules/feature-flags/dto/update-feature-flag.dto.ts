import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFeatureFlagDto {
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
