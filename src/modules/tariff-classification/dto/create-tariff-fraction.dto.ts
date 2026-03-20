import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

const MEASUREMENT_UNITS = [
  'KG',
  'L',
  'M',
  'M2',
  'M3',
  'PZ',
  'PAR',
  'JGO',
  'GR',
  'KWH',
  'OTHER',
] as const;
type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

export class CreateTariffFractionDto {
  @IsString()
  subheadingId: string;

  @IsString()
  @MinLength(8)
  @MaxLength(10)
  code: string;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsString()
  @MinLength(1)
  description: string;

  @IsEnum(MEASUREMENT_UNITS)
  measurementUnit: MeasurementUnit;

  @IsString()
  importTariffRate: string;

  @IsString()
  exportTariffRate: string;

  @IsOptional()
  @IsString()
  vatRate?: string;

  @IsOptional()
  @IsString()
  iepsRate?: string;

  @IsOptional()
  @IsString()
  isanApplies?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
