import { IsString, IsOptional } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
