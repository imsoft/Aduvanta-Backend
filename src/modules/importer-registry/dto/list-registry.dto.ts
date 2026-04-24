import { IsOptional, IsInt, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const REGISTRY_STATUSES = ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED'] as const;

export class ListImporterRegistryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(REGISTRY_STATUSES)
  status?: (typeof REGISTRY_STATUSES)[number];

  @IsOptional()
  @IsString()
  clientId?: string;
}
