import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDocumentRequirementDto {
  @IsString()
  @IsUUID()
  documentCategoryId: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
