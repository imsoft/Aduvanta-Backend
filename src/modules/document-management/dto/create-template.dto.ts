import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  variablesSchema?: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
