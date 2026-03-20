import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTariffHeadingDto {
  @IsString()
  chapterId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(4)
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
