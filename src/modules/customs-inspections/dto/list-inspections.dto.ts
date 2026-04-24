import { IsOptional, IsInt, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const SEMAPHORE_COLORS = ['GREEN', 'RED'] as const;
const INSPECTION_RESULTS = [
  'PENDING',
  'PASSED',
  'DISCREPANCY',
  'SEIZED',
  'PARTIAL_SEIZURE',
  'SAMPLE_TAKEN',
] as const;

export class ListInspectionsDto {
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
  @IsEnum(SEMAPHORE_COLORS)
  semaphoreColor?: (typeof SEMAPHORE_COLORS)[number];

  @IsOptional()
  @IsEnum(INSPECTION_RESULTS)
  inspectionResult?: (typeof INSPECTION_RESULTS)[number];
}
