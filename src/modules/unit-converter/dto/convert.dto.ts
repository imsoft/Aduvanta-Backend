import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ConvertDto {
  @IsString()
  category: string;

  @IsString()
  fromUnit: string;

  @IsString()
  toUnit: string;

  @Type(() => Number)
  @IsNumber()
  value: number;
}
