import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumberString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

const PROGRAM_TYPES = [
  'MANUFACTURERA',
  'MAQUILADORA',
  'SERVICIOS',
  'ALBERGUE',
  'CONTROLADORA',
] as const;

export class CreateImmexProgramDto {
  @IsString()
  clientId: string;

  @IsString()
  programNumber: string;

  @IsEnum(PROGRAM_TYPES)
  programType: (typeof PROGRAM_TYPES)[number];

  @IsString()
  @MaxLength(13)
  rfc: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsDateString()
  authorizationDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsNumberString()
  annualExportCommitmentUsd?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  renovationAlertDays?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
