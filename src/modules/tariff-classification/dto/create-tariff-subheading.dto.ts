import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTariffSubheadingDto {
  @IsString()
  headingId: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
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
