import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateValuationDto {
  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  valuationMethod?: string;

  @IsOptional()
  @IsString()
  declarationNumber?: string;

  @IsOptional()
  @IsDateString()
  declarationDate?: string;

  @IsOptional()
  @IsString()
  customsOfficeName?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  supplierTaxId?: string;

  @IsOptional()
  @IsString()
  supplierAddress?: string;

  @IsOptional()
  @IsString()
  supplierCountry?: string;

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsString()
  buyerTaxId?: string;

  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  invoiceCurrency?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsOptional()
  @IsString()
  totalInvoiceValue?: string;

  @IsOptional()
  @IsString()
  totalInvoiceValueMxn?: string;

  @IsOptional()
  @IsString()
  totalIncrementables?: string;

  @IsOptional()
  @IsString()
  totalNonIncrementables?: string;

  @IsOptional()
  @IsString()
  totalCustomsValue?: string;

  @IsOptional()
  @IsString()
  incoterm?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
