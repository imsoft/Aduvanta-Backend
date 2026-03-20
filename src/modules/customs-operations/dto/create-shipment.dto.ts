import { IsString, IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';

const SHIPMENT_TYPES = ['IMPORT', 'EXPORT', 'TRANSIT'] as const;
type ShipmentType = (typeof SHIPMENT_TYPES)[number];

export class CreateShipmentDto {
  @IsEnum(SHIPMENT_TYPES)
  type: ShipmentType;

  @IsString()
  trackingNumber: string;

  @IsOptional()
  @IsString()
  primaryEntryId?: string;

  @IsOptional()
  @IsString()
  clientReference?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientTaxId?: string;

  @IsOptional()
  @IsString()
  goodsDescription?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  destinationCity?: string;

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
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNumber?: string;

  @IsOptional()
  @IsString()
  billOfLading?: string;

  @IsOptional()
  @IsString()
  containerNumbers?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalPackages?: number;

  @IsOptional()
  @IsString()
  totalGrossWeightKg?: string;

  @IsOptional()
  @IsString()
  declaredValueUsd?: string;

  @IsOptional()
  @IsString()
  estimatedArrivalDate?: string;

  @IsOptional()
  @IsString()
  customsOfficeId?: string;
}
