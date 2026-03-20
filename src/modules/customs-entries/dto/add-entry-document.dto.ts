import { IsString, IsOptional } from 'class-validator';

export class AddEntryDocumentDto {
  @IsString()
  documentTypeCode: string;

  @IsString()
  documentTypeName: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  documentDate?: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
