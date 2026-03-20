import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateEDocumentItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  itemNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

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

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @IsOptional()
  @IsString()
  unitPrice?: string;

  @IsOptional()
  @IsString()
  totalValue?: string;

  @IsOptional()
  @IsString()
  specificIdentifier?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
