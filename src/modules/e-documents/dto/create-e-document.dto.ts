import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateEDocumentDto {
  @IsOptional()
  @IsString()
  entryId?: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsString()
  sellerName: string;

  @IsOptional()
  @IsString()
  sellerTaxId?: string;

  @IsOptional()
  @IsString()
  sellerAddress?: string;

  @IsOptional()
  @IsString()
  sellerCountry?: string;

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
  @IsBoolean()
  isSubdivided?: boolean;

  @IsOptional()
  @IsString()
  parentEDocumentId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
