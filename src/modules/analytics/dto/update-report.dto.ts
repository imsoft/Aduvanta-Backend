import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  queryConfig?: string;

  @IsOptional()
  @IsString()
  filtersConfig?: string;

  @IsOptional()
  @IsString()
  columnsConfig?: string;

  @IsOptional()
  @IsString()
  chartConfig?: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
