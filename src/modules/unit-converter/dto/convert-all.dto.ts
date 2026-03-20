import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ConvertAllDto {
  @IsString()
  category: string;

  @IsString()
  fromUnit: string;

  @Type(() => Number)
  @IsNumber()
  value: number;
}
