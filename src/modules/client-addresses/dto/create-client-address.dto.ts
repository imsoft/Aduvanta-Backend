import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClientAddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  street1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reference?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
