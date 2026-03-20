import { IsString, IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';

const CUSTOMS_REGIMES = [
  'IMP_DEFINITIVA',
  'EXP_DEFINITIVA',
  'IMP_TEMPORAL',
  'EXP_TEMPORAL',
  'DEPOSITO_FISCAL',
  'TRANSITO_INTERNO',
  'TRANSITO_INTERNACIONAL',
  'ELABORACION_TRANSFORMACION',
  'REEXPEDICION',
  'RETORNO',
  'REGULARIZACION',
  'CAMBIO_REGIMEN',
  'EXTRACCION_DEPOSITO',
  'VIRTUAL',
  'OTHER',
] as const;
type CustomsRegime = (typeof CUSTOMS_REGIMES)[number];

export class CreateCustomsEntryDto {
  @IsString()
  customsOfficeId: string;

  @IsString()
  patentId: string;

  @IsString()
  entryKey: string;

  @IsEnum(CUSTOMS_REGIMES)
  regime: CustomsRegime;

  // 1 = Import, 2 = Export
  @IsInt()
  @Min(1)
  @Max(2)
  operationType: number;

  @IsOptional()
  @IsString()
  entryDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  transportMode?: number;

  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsOptional()
  @IsString()
  transportDocumentNumber?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsOptional()
  @IsString()
  invoiceCurrency?: string;

  @IsOptional()
  @IsString()
  internalReference?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
