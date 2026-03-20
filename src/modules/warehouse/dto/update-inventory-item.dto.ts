import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  weightKg?: string;

  @IsOptional()
  @IsString()
  volumeM3?: string;

  @IsOptional()
  @IsString()
  pedimentoNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageDays?: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
