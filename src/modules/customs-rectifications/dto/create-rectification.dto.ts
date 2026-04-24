import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const RECTIFICATION_REASONS = [
  'DATA_ERROR',
  'TARIFF_FRACTION',
  'VALUE_ADJUSTMENT',
  'DESCRIPTION_CORRECTION',
  'QUANTITY_ADJUSTMENT',
  'REGIME_CHANGE',
  'TAX_CORRECTION',
  'PARTY_DATA',
  'OTHER',
] as const;

class FieldChangeDto {
  @IsString()
  fieldPath: string;

  @IsString()
  fieldLabel: string;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;
}

export class CreateRectificationDto {
  @IsString()
  originalEntryId: string;

  @IsEnum(RECTIFICATION_REASONS)
  reason: (typeof RECTIFICATION_REASONS)[number];

  @IsString()
  reasonDescription: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldChangeDto)
  fieldChanges?: FieldChangeDto[];

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
