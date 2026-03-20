import { IsString, IsOptional } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  satAuthorizationNumber?: string;

  @IsOptional()
  @IsString()
  bondedWarehouseLicense?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
