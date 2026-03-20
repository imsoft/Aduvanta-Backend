import { IsString, IsOptional } from 'class-validator';

export class UpdateCupoLetterDto {
  @IsOptional()
  @IsString()
  letterNumber?: string;

  @IsOptional()
  @IsString()
  folio?: string;

  @IsOptional()
  @IsString()
  importerRfc?: string;

  @IsOptional()
  @IsString()
  importerName?: string;

  @IsOptional()
  @IsString()
  tariffFraction?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsString()
  tradeAgreement?: string;

  @IsOptional()
  @IsString()
  preferentialTariffRate?: string;

  @IsOptional()
  @IsString()
  normalTariffRate?: string;

  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  seReferenceNumber?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
