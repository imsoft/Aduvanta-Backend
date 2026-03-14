import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateDocumentCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
