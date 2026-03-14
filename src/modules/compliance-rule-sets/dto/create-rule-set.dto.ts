import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateRuleSetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'code must be uppercase alphanumeric with underscores',
  })
  code: string;

  @IsIn(['IMPORT', 'EXPORT', 'INTERNAL'])
  operationType: 'IMPORT' | 'EXPORT' | 'INTERNAL';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
