import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  invoiceId: string;

  @IsString()
  method: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
