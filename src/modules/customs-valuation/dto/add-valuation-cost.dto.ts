import { IsString, IsOptional } from 'class-validator';

export class AddValuationCostDto {
  @IsString()
  category: string;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  amountCurrency?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  amountMxn: string;

  @IsOptional()
  @IsString()
  prorationMethod?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
