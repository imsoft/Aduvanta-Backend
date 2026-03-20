import { IsString, IsOptional } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}
