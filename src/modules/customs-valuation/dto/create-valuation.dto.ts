import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateValuationDto {
  @IsOptional()
  @IsString()
  entryId?: string;

  @IsString()
  valuationMethod: string;

  @IsOptional()
  @IsString()
  declarationNumber?: string;

  @IsOptional()
  @IsDateString()
  declarationDate?: string;

  @IsOptional()
  @IsString()
  customsOfficeName?: string;

  @IsString()
  supplierName: string;

  @IsOptional()
  @IsString()
  supplierTaxId?: string;

  @IsOptional()
  @IsString()
  supplierAddress?: string;

  @IsOptional()
  @IsString()
  supplierCountry?: string;

  @IsString()
  buyerName: string;

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
  incoterm?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
