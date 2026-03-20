import { IsString, IsOptional } from 'class-validator';

export class RegisterUsageDto {
  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  pedimentoNumber?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsString()
  quantityUsed: string;

  @IsString()
  unitOfMeasure: string;

  @IsOptional()
  @IsString()
  usageDate?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
