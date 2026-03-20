import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateEDocumentDto {
  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsOptional()
  @IsString()
  sellerName?: string;

  @IsOptional()
  @IsString()
  sellerTaxId?: string;

  @IsOptional()
  @IsString()
  sellerAddress?: string;

  @IsOptional()
  @IsString()
  sellerCountry?: string;

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
  buyerCountry?: string;

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
  totalInvoiceValue?: string;

  @IsOptional()
  @IsString()
  totalItems?: string;

  @IsOptional()
  @IsBoolean()
  isSubdivided?: boolean;

  @IsOptional()
  @IsString()
  parentEDocumentId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
