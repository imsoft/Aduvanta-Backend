import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

const INSPECTION_TYPES = [
  'DOCUMENTAL',
  'FISICO_ALEATORIO',
  'FISICO_SELECTIVO',
  'FISICO_TOTAL',
  'RECONOCIMIENTO_ADUANERO',
] as const;

const SEMAPHORE_COLORS = ['GREEN', 'RED'] as const;

export class CreateInspectionDto {
  @IsString()
  entryId: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

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
  @IsString()
  actaNumber?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
