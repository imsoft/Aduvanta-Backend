import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';

const REGISTRY_TYPES = ['GENERAL', 'SECTORIAL', 'BOTH'] as const;

export class CreateImporterRegistryDto {
  @IsString()
  clientId: string;

  @IsEnum(REGISTRY_TYPES)
  registryType: (typeof REGISTRY_TYPES)[number];

  @IsString()
  @MaxLength(13)
  rfc: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsDateString()
  inscriptionDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  satFolioNumber?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
