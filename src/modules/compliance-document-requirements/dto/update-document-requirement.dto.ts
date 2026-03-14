import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDocumentRequirementDto {
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
