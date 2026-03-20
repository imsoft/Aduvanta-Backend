import { IsString, IsOptional } from 'class-validator';

export class CreateCupoLetterDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  letterNumber?: string;

  @IsOptional()
  @IsString()
  folio?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  importerRfc?: string;

  @IsOptional()
  @IsString()
  importerName?: string;

  @IsOptional()
  @IsString()
  tariffFraction?: string;

  @IsString()
  productDescription: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsString()
  tradeAgreement?: string;

  @IsString()
  authorizedQuantity: string;

  @IsString()
  unitOfMeasure: string;

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
