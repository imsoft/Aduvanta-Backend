import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumberString,
  Min,
} from 'class-validator';

const INSPECTION_RESULTS = [
  'PENDING',
  'PASSED',
  'DISCREPANCY',
  'SEIZED',
  'PARTIAL_SEIZURE',
  'SAMPLE_TAKEN',
] as const;

const INSPECTION_TYPES = [
  'DOCUMENTAL',
  'FISICO_ALEATORIO',
  'FISICO_SELECTIVO',
  'FISICO_TOTAL',
  'RECONOCIMIENTO_ADUANERO',
] as const;

const SEMAPHORE_COLORS = ['GREEN', 'RED'] as const;

export class UpdateInspectionDto {
  @IsOptional()
  @IsEnum(SEMAPHORE_COLORS)
  semaphoreColor?: (typeof SEMAPHORE_COLORS)[number];

  @IsOptional()
  @IsDateString()
  modulationDate?: string;

  @IsOptional()
  @IsEnum(INSPECTION_TYPES)
  inspectionType?: (typeof INSPECTION_TYPES)[number];

  @IsOptional()
  @IsEnum(INSPECTION_RESULTS)
  inspectionResult?: (typeof INSPECTION_RESULTS)[number];

  @IsOptional()
  @IsString()
  inspectorName?: string;

  @IsOptional()
  @IsString()
  inspectorBadge?: string;

  @IsOptional()
  @IsString()
  inspectionLocation?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  packagesInspected?: number;

  @IsOptional()
  @IsBoolean()
  discrepanciesFound?: boolean;

  @IsOptional()
  @IsString()
  discrepancyDescription?: string;

  @IsOptional()
  @IsNumberString()
  penaltyAmount?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  samplesTaken?: number;

  @IsOptional()
  @IsString()
  sampleDescription?: string;

  @IsOptional()
  @IsString()
  actaNumber?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
