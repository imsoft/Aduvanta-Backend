import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateReportDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  queryConfig: string;

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
