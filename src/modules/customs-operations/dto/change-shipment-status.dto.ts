import { IsString, IsOptional, IsEnum } from 'class-validator';

const SHIPMENT_STATUSES = [
  'PENDING',
  'IN_TRANSIT',
  'AT_CUSTOMS',
  'PREVIO',
  'DISPATCHING',
  'MODULATION',
  'GREEN_LIGHT',
  'RED_LIGHT',
  'INSPECTION',
  'RELEASED',
  'DELIVERED',
  'HELD',
  'CANCELLED',
] as const;
type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export class ChangeShipmentStatusDto {
  @IsEnum(SHIPMENT_STATUSES)
  status: ShipmentStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
