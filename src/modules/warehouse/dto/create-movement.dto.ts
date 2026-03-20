import { IsString, IsOptional } from 'class-validator';

export class CreateMovementDto {
  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @IsString()
  direction: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  productDescription: string;

  @IsString()
  quantity: string;

  @IsString()
  unitOfMeasure: string;

  @IsOptional()
  @IsString()
  weightKg?: string;

  @IsOptional()
  @IsString()
  fromZoneId?: string;

  @IsOptional()
  @IsString()
  toZoneId?: string;

  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  sealNumber?: string;

  @IsOptional()
  @IsString()
  pedimentoNumber?: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
