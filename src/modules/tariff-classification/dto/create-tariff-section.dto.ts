import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTariffSectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10)
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
