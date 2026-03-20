import { IsString, IsOptional, IsDateString } from 'class-validator';

export class AddShipmentStageDto {
  @IsString()
  stageName: string;

  @IsString()
  stageLabel: string;

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
