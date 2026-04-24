import { IsOptional, IsInt, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const PROGRAM_STATUSES = ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'IN_RENOVATION'] as const;

export class ListImmexProgramsDto {
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
  @IsEnum(PROGRAM_STATUSES)
  status?: (typeof PROGRAM_STATUSES)[number];

  @IsOptional()
  @IsString()
  clientId?: string;
}
