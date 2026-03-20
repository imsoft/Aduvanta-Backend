import { IsOptional, IsString } from 'class-validator';

export class ExecuteReportDto {
  @IsOptional()
  @IsString()
  filtersApplied?: string;

  @IsOptional()
  @IsString()
  exportFormat?: string;
}
