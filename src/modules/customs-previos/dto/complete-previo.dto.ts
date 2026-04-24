import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumberString,
  Min,
} from 'class-validator';

export class CompletePrevioDto {
  @IsDateString()
  startedAt: string;

  @IsDateString()
  completedAt: string;

  @IsInt()
  @Min(0)
  foundPackages: number;

  @IsNumberString()
  foundGrossWeightKg: string;

  @IsBoolean()
  packageDiscrepancy: boolean;

  @IsBoolean()
  discrepanciesFound: boolean;

  @IsOptional()
  @IsString()
  discrepancyNotes?: string;

  @IsBoolean()
  photographsTaken: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  photographCount?: number;

  @IsOptional()
  @IsString()
  reportFileKey?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
