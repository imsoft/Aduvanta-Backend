import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  productDescription: string;

  @IsOptional()
  @IsString()
  tariffFraction?: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsString()
  quantity: string;

  @IsString()
  unitOfMeasure: string;

  @IsOptional()
  @IsString()
  weightKg?: string;

  @IsOptional()
  @IsString()
  volumeM3?: string;

  @IsOptional()
  @IsString()
  declaredValueUsd?: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsString()
  pedimentoNumber?: string;

  @IsOptional()
  @IsString()
  entryDate?: string;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageDays?: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
