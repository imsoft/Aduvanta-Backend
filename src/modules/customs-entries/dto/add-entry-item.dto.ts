import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class AddEntryItemDto {
  @IsInt()
  @Min(1)
  itemNumber: number;

  @IsString()
  tariffFractionId: string;

  @IsString()
  tariffFractionCode: string;

  @IsString()
  description: string;

  @IsString()
  originCountry: string;

  @IsString()
  quantity: string;

  @IsString()
  measurementUnit: string;

  @IsOptional()
  @IsString()
  grossWeightKg?: string;

  @IsOptional()
  @IsString()
  netWeightKg?: string;

  @IsString()
  commercialValueCurrency: string;

  @IsString()
  commercialValueUsd: string;

  @IsString()
  customsValueMxn: string;

  @IsOptional()
  @IsString()
  incrementablesMxn?: string;

  @IsOptional()
  @IsString()
  tradeAgreementCode?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
