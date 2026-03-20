import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateFundMovementDto {
  @IsString()
  type: string;

  @IsString()
  category: string;

  @IsString()
  bankAccountId: string;

  @IsOptional()
  @IsString()
  destinationAccountId?: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsString()
  amountMxn: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsString()
  description: string;

  @IsDateString()
  movementDate: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
