import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTariffChapterDto {
  @IsString()
  sectionId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  code: string;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
