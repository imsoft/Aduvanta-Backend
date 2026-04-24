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

const PREVIO_TYPES = ['FULL', 'PARTIAL', 'SAMPLING'] as const;

export class CreatePrevioDto {
  @IsString()
  previoNumber: string;

  @IsEnum(PREVIO_TYPES)
  type: (typeof PREVIO_TYPES)[number];

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  warehouseName?: string;

  @IsOptional()
  @IsString()
  warehouseAddress?: string;

  @IsOptional()
  @IsString()
  customsOfficeId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  inspectorName?: string;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  declaredPackages?: number;

  @IsOptional()
  @IsNumberString()
  declaredGrossWeightKg?: string;

  @IsOptional()
  @IsString()
  containerNumbers?: string;

  @IsOptional()
  @IsString()
  sealNumbers?: string;

  @IsOptional()
  @IsBoolean()
  sealIntact?: boolean;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
