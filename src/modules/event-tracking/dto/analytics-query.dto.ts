import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class FunnelQueryDto extends DateRangeDto {
  @IsArray()
  @IsString({ each: true })
  steps: string[];
}

export class RetentionQueryDto {
  @IsDateString()
  cohortMonth: string;
}

export class RecentEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;
}
