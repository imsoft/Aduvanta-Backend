import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumberString,
  IsDateString,
} from 'class-validator';

const MOVEMENT_TYPES = [
  'ADVANCE_RECEIVED',
  'OVERPAYMENT_CREDIT',
  'CORRECTION_CREDIT',
  'CUSTOMS_DUTIES_PAID',
  'STORAGE_PAID',
  'TRANSPORT_PAID',
  'AGENCY_FEE',
  'OTHER_EXPENSES',
  'INVOICE_CHARGED',
  'CORRECTION_DEBIT',
] as const;

export class CreateAccountMovementDto {
  @IsString()
  clientId: string;

  @IsEnum(MOVEMENT_TYPES)
  type: (typeof MOVEMENT_TYPES)[number];

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumberString()
  exchangeRate?: string;

  @IsOptional()
  @IsString()
  operationId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  movementDate: string;
}
