import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class AddExpenseAccountItemDto {
  @IsInt()
  @Min(1)
  itemNumber: number;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsString()
  amountMxn: string;

  @IsOptional()
  @IsString()
  taxAmount?: string;

  @IsOptional()
  @IsString()
  operationChargeId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
