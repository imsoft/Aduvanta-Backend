import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddInvoiceItemDto {
  @IsInt()
  @Min(1)
  itemNumber: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  satProductCode?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsString()
  unitPrice: string;

  @IsString()
  subtotal: string;

  @IsOptional()
  @IsString()
  taxRate?: string;

  @IsOptional()
  @IsString()
  taxAmount?: string;

  @IsString()
  total: string;

  @IsOptional()
  @IsString()
  operationChargeId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
