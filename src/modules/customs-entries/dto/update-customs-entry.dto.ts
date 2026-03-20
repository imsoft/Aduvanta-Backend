import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateCustomsEntryDto {
  @IsOptional()
  @IsString()
  entryKey?: string;

  @IsOptional()
  @IsString()
  entryDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  transportMode?: number;

  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsOptional()
  @IsString()
  transportDocumentNumber?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsOptional()
  @IsString()
  invoiceCurrency?: string;

  @IsOptional()
  @IsString()
  internalReference?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
