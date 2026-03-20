import { IsString, IsOptional } from 'class-validator';

export class QueryKpiDto {
  @IsString()
  metricName: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
