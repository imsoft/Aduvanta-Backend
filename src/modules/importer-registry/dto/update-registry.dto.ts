import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

const REGISTRY_STATUSES = ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED'] as const;

export class UpdateImporterRegistryDto {
  @IsOptional()
  @IsEnum(REGISTRY_STATUSES)
  status?: (typeof REGISTRY_STATUSES)[number];

  @IsOptional()
  @IsDateString()
  inscriptionDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsDateString()
  lastVerificationDate?: string;

  @IsOptional()
  @IsString()
  satFolioNumber?: string;

  @IsOptional()
  @IsString()
  suspensionReason?: string;

  @IsOptional()
  @IsDateString()
  suspensionDate?: string;

  @IsOptional()
  @IsBoolean()
  alertSent?: boolean;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
