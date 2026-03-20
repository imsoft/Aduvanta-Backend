import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddEDocumentItemDto {
  @IsInt()
  @Min(1)
  itemNumber: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  tariffFractionCode?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsString()
  quantity: string;

  @IsString()
  measurementUnit: string;

  @IsString()
  unitPrice: string;

  @IsString()
  totalValue: string;

  @IsOptional()
  @IsString()
  specificIdentifier?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
