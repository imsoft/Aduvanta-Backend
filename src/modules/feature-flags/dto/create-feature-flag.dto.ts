import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFeatureFlagDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  key: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  isEnabled: boolean;
}
