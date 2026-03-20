import { IsString, IsOptional } from 'class-validator';

export class UpdateValuationCostDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  amountCurrency?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  amountMxn?: string;

  @IsOptional()
  @IsString()
  prorationMethod?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
