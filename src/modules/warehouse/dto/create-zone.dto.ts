import { IsString, IsOptional } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  capacityUnits?: string;

  @IsOptional()
  @IsString()
  capacityUnitType?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
