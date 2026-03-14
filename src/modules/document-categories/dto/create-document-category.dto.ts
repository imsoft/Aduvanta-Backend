import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateDocumentCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'code must contain only uppercase letters, digits, and underscores',
  })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
