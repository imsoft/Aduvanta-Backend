import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBillingOverrideDto {
  @IsString()
  organizationId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent: number = 100;

  @IsBoolean()
  isFree: boolean = true;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsISO8601()
  validUntil?: string;
}

export class UpdateBillingOverrideDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsISO8601()
  validUntil?: string | null;
}
