import { IsOptional, IsInt, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const PREVIO_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

export class ListPreviosDto {
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
  entryId?: string;

  @IsOptional()
  @IsEnum(PREVIO_STATUSES)
  status?: (typeof PREVIO_STATUSES)[number];

  @IsOptional()
  @IsString()
  q?: string;
}
