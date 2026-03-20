import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  capacityUnits?: string;

  @IsOptional()
  @IsString()
  capacityUnitType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;
}
