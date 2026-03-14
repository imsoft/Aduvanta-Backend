import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateOperationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn(['IMPORT', 'EXPORT', 'INTERNAL'])
  type?: 'IMPORT' | 'EXPORT' | 'INTERNAL';

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
